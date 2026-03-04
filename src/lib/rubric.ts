export interface RubricOption {
  deduction: number;
  comment: string;
}

export interface RubricItem {
  id: string;
  label: string;
  maxPoints: number;
  options: RubricOption[];
}

export interface RubricGroup {
  id: string;
  label: string;
  maxPoints: number;
  items: RubricItem[];
}

export const RUBRIC: RubricGroup[] = [
  {
    id: "q1",
    label: "Q1 Project Information",
    maxPoints: 0.5,
    items: [
      {
        id: "q1",
        label: "Project Information",
        maxPoints: 0.5,
        options: [
          { deduction: 0, comment: "Complete (Has title, team member names, custom or default project; for custom projects: whether the project is shared, and the TA mentor)" },
          { deduction: -0.25, comment: "Missing a component from above" },
          { deduction: -0.5, comment: "Missing" },
        ],
      },
    ],
  },
  {
    id: "q2",
    label: "Q2 Abstract",
    maxPoints: 0.5,
    items: [
      {
        id: "q2",
        label: "Abstract",
        maxPoints: 0.5,
        options: [
          { deduction: 0, comment: "Abstract motivates the problem, describes the goals, and highlights main findings in a concise, high-level, and convincing way" },
          { deduction: -0.25, comment: "Lacking one of the above aspects or too long" },
          { deduction: -0.25, comment: "Hard to understand" },
          { deduction: -0.5, comment: "Missing" },
        ],
      },
    ],
  },
  {
    id: "q3",
    label: "Q3 Approach",
    maxPoints: 2,
    items: [
      {
        id: "q3.1",
        label: "Q3.1 Main approaches, e.g., key equations",
        maxPoints: 1,
        options: [
          { deduction: 0, comment: "Clearly describes approach (architecture of the models, methods, or algorithms) with specificity and technical detail, including equations and figures as appropriate" },
          { deduction: -0.25, comment: "Missing minor details or specificity" },
          { deduction: -0.5, comment: "Missing some details or specificity" },
          { deduction: -0.75, comment: "Missing significant details or specificity" },
          { deduction: -1.0, comment: "Missing" },
        ],
      },
      {
        id: "q3.2",
        label: "Q3.2 Baselines",
        maxPoints: 0.5,
        options: [
          { deduction: 0, comment: "Describes baseline(s) either in detail (if original) or refers to other papers for details" },
          { deduction: -0.25, comment: "Please note that there are previous works for this task, please refer to a few (one or two) as your baselines" },
          { deduction: -0.5, comment: "Does not present any adequate baseline methods" },
        ],
      },
      {
        id: "q3.3",
        label: "Q3.3 Explain novelty of the methods or provide references",
        maxPoints: 0.5,
        options: [
          { deduction: 0, comment: "Complete" },
          { deduction: -0.1, comment: "Novelty not strong or convincing enough" },
          { deduction: -0.25, comment: "References not provided for methods from existing work" },
          { deduction: -0.5, comment: "Missing (Does not explain if approaches are original or from existing work)" },
        ],
      },
    ],
  },
  {
    id: "q4",
    label: "Q4 Experiment",
    maxPoints: 2.5,
    items: [
      {
        id: "q4.1",
        label: "Q4.1 Data",
        maxPoints: 0.5,
        options: [
          { deduction: 0, comment: "Mentions at least one specific dataset with sizes (preexisting or a dataset they are collecting/designing) with references if relevant, and describes the task associated with the dataset" },
          { deduction: -0.25, comment: "(For using an existing dataset) missing references or a particular detail above" },
          { deduction: -0.25, comment: "Does not clearly describe the task associated with the dataset" },
          { deduction: -0.5, comment: "Missing" },
        ],
      },
      {
        id: "q4.2",
        label: "Q4.2 Evaluation methods",
        maxPoints: 0.5,
        options: [
          { deduction: 0, comment: "Provides detailed explanation of the evaluation method with clear metrics" },
          { deduction: -0.25, comment: "Unclear description of the evaluation methods" },
          { deduction: -0.5, comment: "Missing" },
        ],
      },
      {
        id: "q4.3",
        label: "Q4.3 Experimental details",
        maxPoints: 0.5,
        options: [
          { deduction: 0, comment: "Complete, including model configurations, learning rate, training time, etc." },
          { deduction: -0.25, comment: "Lacking important details" },
          { deduction: -0.5, comment: "Missing" },
        ],
      },
      {
        id: "q4.4",
        label: "Q4.4 Results",
        maxPoints: 1,
        options: [
          { deduction: 0, comment: "Complete, includes quantitative results and discussion/analysis of quantitative results (Default projects: make at least one submission to the dev leaderboard for paraphrase detection and report the accuracy. The submission to the dev leaderboard should match (+/- 0.02) or outperform the baseline score (>= 0.862))" },
          { deduction: -0.25, comment: "Default project: submitted to leaderboard but submission does not match (+/- 0.02) or outperform the baseline score (0.862)" },
          { deduction: -0.5, comment: "Default project: no submission to leaderboard or accuracy not reported" },
          { deduction: -0.5, comment: "Missing discussion/analysis of quantitative results" },
          { deduction: -0.5, comment: "Missing some quantitative results" },
          { deduction: -0.5, comment: "Not enough progress respective to team size" },
          { deduction: -0.75, comment: "Missing key quantitative results" },
          { deduction: -1.0, comment: "Missing" },
        ],
      },
    ],
  },
  {
    id: "q5",
    label: "Q5 Future Work",
    maxPoints: 0.5,
    items: [
      {
        id: "q5",
        label: "Future Work",
        maxPoints: 0.5,
        options: [
          { deduction: 0, comment: "Complete" },
          { deduction: -0.25, comment: "Insufficient goals for the final report" },
          { deduction: -0.25, comment: "Is vague or lacks detail" },
          { deduction: -0.25, comment: "Went over 2-page limit" },
          { deduction: -0.5, comment: "Missing" },
        ],
      },
    ],
  },
];

export const TOTAL_POINTS = RUBRIC.reduce((sum, g) => sum + g.maxPoints, 0);

export function computeScore(selections: Record<string, number>): number {
  let score = TOTAL_POINTS;
  for (const group of RUBRIC) {
    for (const item of group.items) {
      const selectedIdx = selections[item.id];
      if (selectedIdx !== undefined && selectedIdx >= 0) {
        score += item.options[selectedIdx].deduction;
      }
    }
  }
  return Math.max(0, Math.round(score * 100) / 100);
}
