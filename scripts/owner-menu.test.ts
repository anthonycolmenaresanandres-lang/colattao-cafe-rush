import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test, before, after } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { initialMenu, publicCategories, safeJsonLd, validateMenu } from "../src/lib/owner/menu-model";
import { menuCategories } from "../src/data/colattaoMenu";

const db = new PGlite();
const business = "00000000-0000-4000-8000-000000000001";
const otherBusiness = "00000000-0000-4000-8000-000000000002";
const owner = "10000000-0000-4000-8000-000000000001";
const editor = "10000000-0000-4000-8000-000000000002";
const viewer = "10000000-0000-4000-8000-000000000003";
const outsider = "10000000-0000-4000-8000-000000000004";

async function identity(user: string | null, role = "authenticated") {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user ?? ""]);
  await db.exec(`set role ${role}`);
}
async function write(operation: string, revision: number, content: unknown = null, restore: number | null = null, target = business) {
  const result = await db.query<{ result: { revision: number; version: number } }>("select public.owner_menu_write($1::uuid,$2::bigint,$3::text,$4::jsonb,$5::bigint) as result", [target, revision, operation, content === null ? null : JSON.stringify(content), restore]);
  return result.rows[0].result;
}
async function published() {
  const result = await db.query<{ menu: { version: number; content: ReturnType<typeof initialMenu> } }>("select public.owner_public_menu('colattao') as menu");
  return result.rows[0].menu;
}

before(async () => {
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public, auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;`);
  await db.exec(await readFile(new URL("../supabase/migrations/0002_owner_menu.sql", import.meta.url), "utf8"));
  for (const id of [owner, editor, viewer, outsider]) await db.query("insert into auth.users values($1::uuid)", [id]);
  await db.exec(await readFile(new URL("../supabase/migrations/0003_owner_menu_seed.sql", import.meta.url), "utf8"));
  await db.query("insert into public.owner_businesses(id,slug,display_name) values($1,'other','Other cafe')", [otherBusiness]);
  await db.query("insert into public.owner_menu_drafts(business_id,content) values($1,$2::jsonb)", [otherBusiness, JSON.stringify(initialMenu())]);
  for (const [id, role] of [[owner, "owner"], [editor, "editor"], [viewer, "viewer"]]) await db.query("insert into public.owner_memberships values($1,$2,$3)", [business, id, role]);
});
after(async () => { await db.close(); });

test("seed preserves every current category, price, description and confirmation flag", async () => {
  const seeded = initialMenu();
  assert.deepEqual(seeded.categories.map((category) => ({ ...category, items: category.items.map(({ id, sourceName, available, ...item }) => {
    assert.ok(id.startsWith(category.id));
    assert.equal(sourceName, item.name);
    assert.equal(available, true);
    return item;
  }) })), menuCategories);
  assert.deepEqual(validateMenu(seeded), seeded);
  await identity(null, "anon");
  assert.deepEqual((await published()).content, seeded);
});

test("anonymous users see only the published snapshot and cannot write or read drafts", async () => {
  await identity(null, "anon");
  assert.equal((await published()).version, 1);
  await assert.rejects(db.query("select * from public.owner_menu_drafts"), /permission denied/);
  await assert.rejects(db.query("select * from public.owner_memberships"), /permission denied/);
  await assert.rejects(db.query("select * from public.owner_menu_publications"), /permission denied/);
  await assert.rejects(write("save", 1, initialMenu()), /permission denied/);
});

test("outsiders and cross-cafe access fail even when IDs are known", async () => {
  await identity(outsider);
  assert.equal((await db.query("select * from public.owner_menu_drafts")).rows.length, 0);
  assert.equal((await db.query("select * from public.owner_businesses")).rows.length, 0);
  await assert.rejects(write("save", 1, initialMenu()), /Not authorized/);
  await identity(owner);
  assert.equal((await db.query("select * from public.owner_menu_drafts")).rows.length, 1);
  await assert.rejects(write("save", 1, initialMenu(), null, otherBusiness), /Not authorized/);
});

test("viewer cannot edit and owners cannot bypass audited writes or promote roles", async () => {
  await identity(viewer);
  await assert.rejects(write("save", 1, initialMenu()), /Not authorized/);
  await identity(owner);
  await assert.rejects(db.query("update public.owner_menu_drafts set revision = 99"), /permission denied/);
  await assert.rejects(db.query("delete from public.owner_menu_publications"), /permission denied/);
  await assert.rejects(db.query("update public.owner_memberships set role = 'owner'"), /permission denied/);
});

test("server and database reject malformed content, duplicate IDs, unknown fields and bad types", async () => {
  await identity(owner);
  const broken: unknown[] = [null, {}, [], { schemaVersion: 1, categories: [] }];
  const badPrice = initialMenu(); (badPrice.categories[0].items[0] as unknown as { price: number }).price = 5; broken.push(badPrice);
  const duplicate = initialMenu(); duplicate.categories[0].items[1].id = duplicate.categories[0].items[0].id; broken.push(duplicate);
  const extra = { ...initialMenu(), admin: true }; broken.push(extra);
  const text = initialMenu(); text.categories[0].title = " "; broken.push(text);
  const control = initialMenu(); control.categories[0].items[0].name = "bad\u0001name"; broken.push(control);
  const missing = initialMenu(); delete (missing.categories[0].items[0] as { available?: boolean }).available; broken.push(missing);
  for (const value of broken) {
    assert.throws(() => validateMenu(value));
    await assert.rejects(write("save", 1, value), /Invalid menu/);
  }
  assert.equal((await published()).version, 1);
});

test("editor saves privately; stale edits fail; only owner publishes atomically", async () => {
  const edited = initialMenu();
  edited.categories[0].items[0].price = "$5.25 / $6.25";
  edited.categories[0].items[1].available = false;
  await identity(editor);
  assert.equal((await write("save", 1, edited)).revision, 2);
  assert.equal((await published()).content.categories[0].items[0].price, "Ask");
  await assert.rejects(write("publish", 2), /Not authorized/);
  await assert.rejects(write("restore", 2, null, 1), /Not authorized/);
  await identity(owner);
  await assert.rejects(write("save", 1, initialMenu()), /Draft changed/);
  const result = await write("publish", 2);
  assert.deepEqual(result, { revision: 3, version: 2 });
  assert.deepEqual((await published()).content, edited);
  assert.equal(publicCategories(edited)[0].items.length, edited.categories[0].items.length - 1);
  assert.equal((await write("publish", 3)).version, 2, "same content does not duplicate publication");
});

test("publication failure rolls back the public pointer, version insert and revision", async () => {
  const changed = initialMenu(); changed.categories[0].items[0].price = "$99";
  await identity(owner);
  const saved = await write("save", 4, changed);
  await db.exec("reset role");
  await db.exec(`create function public.test_fail_publish() returns trigger language plpgsql as $$ begin raise exception 'Simulated outage'; end; $$;
    create trigger test_fail before update on public.owner_businesses for each row execute function public.test_fail_publish();`);
  await identity(owner);
  await assert.rejects(write("publish", saved.revision), /Simulated outage/);
  assert.equal((await published()).version, 2);
  const state = await db.query<{ revision: number }>("select revision from public.owner_menu_drafts");
  assert.equal(state.rows[0].revision, saved.revision);
  assert.equal((await db.query("select version from public.owner_menu_publications")).rows.length, 2);
  await db.exec("reset role; drop trigger test_fail on public.owner_businesses; drop function public.test_fail_publish();");
});

test("restore creates a new version and replaces draft without destroying history", async () => {
  await identity(owner);
  await assert.rejects(write("restore", 5, null, 999), /Version not found/);
  const result = await write("restore", 5, null, 1);
  assert.deepEqual(result, { revision: 6, version: 3 });
  assert.deepEqual((await published()).content, initialMenu());
  const history = await db.query<{ restored_from: number }>("select restored_from from public.owner_menu_publications where version=3");
  assert.equal(history.rows[0].restored_from, 1);
  assert.equal((await db.query("select * from public.owner_menu_publications")).rows.length, 3);
});

test("revoking membership immediately prevents further reads and writes", async () => {
  await db.exec("reset role");
  await db.query("delete from public.owner_memberships where user_id=$1", [editor]);
  await identity(editor);
  assert.equal((await db.query("select * from public.owner_menu_drafts")).rows.length, 0);
  await assert.rejects(write("save", 6, initialMenu()), /Not authorized/);
});

test("editable text cannot close a JSON-LD script element", () => {
  const attack = { name: '</script><script>alert("x")</script>' };
  assert.ok(!safeJsonLd(attack).includes("<"));
  assert.deepEqual(JSON.parse(safeJsonLd(attack)), attack);
});
