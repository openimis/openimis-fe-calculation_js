import {
    formatServerError, formatGraphQLError
} from "@openimis/fe-core";

function reducer(
    state = {
        fetchingLinkedClassList: false,
        fetchedLinkedClassList: false,
        linkedClassList: [],
        errorLinkedClassList: null,
        fetchingCalculationParamsList: false,
        fetchedCalculationParamsList: false,
        calculationParamsList: [],
        errorCalculationParamsList: null
    },
    action
) {
    switch(action.type) {
        case "CALCULATION_LINKEDCLASSLIST_REQ":
            return {
                ...state,
                fetchingLinkedClassList: true,
                fetchedLinkedClassList: false,
                linkedClassList: [],
                errorLinkedClassList: null
            };
        case "CALCULATION_LINKEDCLASSLIST_RESP":
            return {
                ...state,
                fetchingLinkedClassList: false,
                fetchedLinkedClassList: true,
                linkedClassList: !!action.payload.data.linkedClass ? action.payload.data.linkedClass.linkedClasses : [],
                errorLinkedClassList: formatGraphQLError(action.payload)
            };
        case "CALCULATION_LINKEDCLASSLIST_ERR":
            return {
                ...state,
                fetchingLinkedClassList: false,
                errorLinkedClassList: formatServerError(action.payload)
            };
        case "CALCULATION_CALCULATIONPARAMSLIST_REQ":
            return {
                ...state,
                fetchingCalculationParamsList: true,
                fetchedCalculationParamsList: false,
                calculationParamsList: [],
                errorCalculationParamsList: null
            };
        case "CALCULATION_CALCULATIONPARAMSLIST_RESP":
            return {
                ...state,
                fetchingCalculationParamsList: false,
                fetchedCalculationParamsList: true,
                calculationParamsList: !!action.payload.data.calculationParams.calculationParams.length
                    ? action.payload.data.calculationParams.calculationParams
                    : state.calculationParamsList,
                errorCalculationParamsList: formatGraphQLError(action.payload)
            };
        case "CALCULATION_CALCULATIONPARAMSLIST_ERR":
            return {
                ...state,
                fetchingCalculationParamsList: false,
                errorCalculationParamsList: formatServerError(action.payload)
            };
        default:
            return state;
    }
}

export default reducer;
