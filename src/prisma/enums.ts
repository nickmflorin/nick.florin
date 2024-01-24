import { Degree } from "./model";

export type DegreeData = {
  readonly label: string;
  readonly abbreviatedLabel: string;
};

export const DegreeDatas: { [key in Degree]: DegreeData } = {
  [Degree.BACHELORS_OF_SCIENCE]: { abbreviatedLabel: "B.S.", label: "Bachelor of Science" },
  [Degree.MASTERS_OF_SCIENCE]: { abbreviatedLabel: "M.S.", label: "Master of Science" },
  [Degree.MASTERS_OF_SCIENCE_IN_ENGINEERING]: {
    abbreviatedLabel: "M.S in Engineering",
    label: "Master of Science in Engineering",
  },
};

export const getDegreeData = (degree: Degree): DegreeData => DegreeDatas[degree];
