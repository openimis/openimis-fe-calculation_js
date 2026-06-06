import reducer from "./reducer";
import messages_en from "./translations/en.json";
import CalculationInput from "./components/CalculationInput";
import CalculationRulePicker from "./pickers/CalculationRulePicker";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  "reducers": [{ key: 'calculation', reducer }],
  "contract.ContractDetails.calculation": [CalculationInput],
  "policyHolder.PolicyHolderInsuree.calculation": [CalculationInput],
  "contributionPlan.ContributionPlan.calculation": [CalculationInput],
  "contributionPlan.ContributionPlan.calculationRule": [CalculationRulePicker]
}

export const CalculationModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}
