
import { classicFrenchLiterature } from "./classic-french-literature";
import { classicPhilosophy } from "./classic-philosophy";
import { classicDystopian } from "./classic-dystopian";
import { selfDevelopmentBooks } from "./self-development";
import { InsertableBook } from "../types";

export const allClassicBooks: InsertableBook[] = [
  ...classicFrenchLiterature,
  ...classicPhilosophy,
  ...classicDystopian,
  ...selfDevelopmentBooks
];
