export type ColattaoGameBackgroundZone = {
  id: "TL" | "TR" | "ML" | "BL" | "MR" | "BR";
  name: string;
  placement: "perimeter";
  content: string;
};

export type ColattaoGameBackgroundProtocol = {
  canvas: {
    width: 941;
    height: 1672;
  };
  gameplayLane: {
    xMin: 225;
    xMax: 725;
    yMin: 100;
    yMax: 1450;
  };
  zones: ColattaoGameBackgroundZone[];
  rules: string[];
};

export const colattaoGameBackgroundProtocol = {
  canvas: {
    width: 941,
    height: 1672,
  },
  gameplayLane: {
    xMin: 225,
    xMax: 725,
    yMin: 100,
    yMax: 1450,
  },
  zones: [
    {
      id: "TL",
      name: "Top left",
      placement: "perimeter",
      content: "Small decor",
    },
    {
      id: "TR",
      name: "Top right",
      placement: "perimeter",
      content: "Decor cluster",
    },
    {
      id: "ML",
      name: "Middle left",
      placement: "perimeter",
      content: "Accent or ingredient",
    },
    {
      id: "BL",
      name: "Bottom left",
      placement: "perimeter",
      content: "Main drink hero",
    },
    {
      id: "MR",
      name: "Middle right",
      placement: "perimeter",
      content: "Secondary drink or light",
    },
    {
      id: "BR",
      name: "Bottom right",
      placement: "perimeter",
      content: "Food or pastry hero",
    },
  ],
  rules: [
    "Canvas must be 941x1672 portrait.",
    "Keep gameplay lane x225-725 y100-1450 visually clear.",
    "Use perimeter props only.",
    "Use TL small decor, TR decor cluster, ML accent or ingredient, BL main drink hero, MR secondary drink or light, and BR food or pastry hero.",
    "Keep the center dark and readable.",
    "Keep the edges warm and cafe styled.",
    "Swap theme, preserve geometry.",
    "Do not require gameplay code changes unless filenames or asset paths change.",
  ],
} as const satisfies ColattaoGameBackgroundProtocol;

export default colattaoGameBackgroundProtocol;
