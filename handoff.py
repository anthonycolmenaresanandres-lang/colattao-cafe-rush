from __future__ import annotations
import argparse
from datetime import datetime
from pathlib import Path

HANDOFF = Path('HANDOFF.md')
SECTIONS = ['STARTED', 'DONE', 'NEXT', 'BLOCKERS', 'NOTES']


def now() -> str:
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')


def ensure_file() -> None:
    if HANDOFF.exists():
        return
    lines = ['# HANDOFF', '']
    for s in SECTIONS:
        lines.extend([f'## {s}', ''])
    HANDOFF.write_text('\n'.join(lines).rstrip() + '\n', encoding='utf-8')


def append(section: str, msg: str) -> None:
    ensure_file()
    text = HANDOFF.read_text(encoding='utf-8').lstrip('\ufeff')
    marker = f'## {section}'
    idx = text.find(marker)
    if idx == -1:
        text += f'\n## {section}\n\n'
        idx = text.find(marker)
    insert_at = idx + len(marker)
    text = text[:insert_at] + f"\n- [{now()}] {msg}" + text[insert_at:]
    HANDOFF.write_text(text, encoding='utf-8')


def show() -> None:
    ensure_file()
    print(HANDOFF.read_text(encoding='utf-8').lstrip('\ufeff'))


def main() -> None:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest='cmd', required=True)
    sub.add_parser('start')
    sub.add_parser('show')
    for name in ['done', 'next', 'block', 'note']:
        p = sub.add_parser(name)
        p.add_argument('msg')

    args = parser.parse_args()
    if args.cmd == 'start':
        append('STARTED', 'Session started')
    elif args.cmd == 'show':
        show()
    elif args.cmd == 'done':
        append('DONE', args.msg)
    elif args.cmd == 'next':
        append('NEXT', args.msg)
    elif args.cmd == 'block':
        append('BLOCKERS', args.msg)
    elif args.cmd == 'note':
        append('NOTES', args.msg)


if __name__ == '__main__':
    main()
