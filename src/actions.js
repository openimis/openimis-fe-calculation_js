import {
    graphql, formatQuery
} from "@openimis/fe-core";

const LINKEDCLASSES_PROJECTION = () => ["linkedClasses"];

const CALCULATIONPARAMS_PROJECTION = () => [
    "calculationParams{type, name, label{en, fr}, rights{read, write, update, replace}, optionSet{value, label{en, fr}}, defaultValue}",
];

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
    return graphql(payload, "CALCULATION_CALCULATIONPARAMSLIST");
}
