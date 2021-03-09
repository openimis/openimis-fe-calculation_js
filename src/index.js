import reducer from "./reducer";
import CalculationInput from "./components/CalculationInput";

const DEFAULT_CONFIG = {
  "reducers": [{ key: 'calculation', reducer }],
  "contract.ContractDetails.calculation": [CalculationInput],
  "policyHolder.PolicyHolderInsuree.calculation": [CalculationInput],
  "contributionPlan.ContributionPlan.calculation": [CalculationInput]
}

export const CalculationModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}
