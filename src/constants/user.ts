import { GENDER } from "../enums/user";
import { TBloodGroup, TGender } from "../interfaces/user";

export const gender: TGender[] = [GENDER.MALE, GENDER.FEMALE];
export const blood_group: TBloodGroup[] = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];
