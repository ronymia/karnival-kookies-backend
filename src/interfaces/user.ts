import { GENDER } from "../enums/user";

export type TGender = GENDER.MALE | GENDER.FEMALE;

export type TBloodGroup =
  | "AB+"
  | "A+"
  | "B+"
  | "O+"
  | "AB-"
  | "A-"
  | "B-"
  | "O-";
