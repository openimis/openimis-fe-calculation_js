import {
    graphql, formatQuery
} from "@openimis/fe-core";

const LINKEDCLASSES_PROJECTION = () => ["linkedClasses"];

const CALCULATIONPARAMS_PROJECTION = () => [
    "calculationParams{type, name, label{en, fr}, rights{read, write, update, replace}, optionSet{value, label{en, fr}}, relevance, condition, defaultValue}",
];

const CALCULATIONRULES_PROJECTION = () => [
    "calculationRules{uuid, calculationClassName}"
]

export function fetchLinkedClassList(className) {
    const payload = formatQuery(
        "linkedClass",
        [`classNameList: ["${className}"]`],
        LINKEDCLASSES_PROJECTION()
    );
    return graphql(payload, "CALCULATION_LINKEDCLASSLIST");
}

export function fetchCalculationParamsList(className, instanceClassName, instanceId) {
    const payload = formatQuery(
        "calculationParams",
        [`className: "${className}", instanceClassName: "${instanceClassName}", instanceId: "${instanceId}"`],
        CALCULATIONPARAMS_PROJECTION()
    );
    return graphql(
        payload,
        "CALCULATION_CALCULATIONPARAMSLIST",
        { requestLabel: `${className}-${instanceClassName}-${instanceId}` }
    );
}

export function fetchCalculationRules(params) {
    let filter = !!params !== [] ? params : null;
    if (filter === undefined) {
        filter = []
    }
    
    var pathname = window.location.pathname 
    if (pathname.includes('contributionPlanBundles')) {
        filter.push(`calcruleType: "account_receivable"`)
    }
    if (pathname.includes('paymentPlans')) {
        filter.push(`calcruleType: "account_payable"`)
    }
    
    const payload = formatQuery(
        "calculationRules",
        filter,
        CALCULATIONRULES_PROJECTION()
    );
    return graphql(payload, "CALCULATION_CALCULATIONRULESLIST");
}
