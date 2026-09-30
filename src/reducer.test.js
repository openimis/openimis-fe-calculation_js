import {
    describe, expect, it, vi,
} from "vitest";

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock("@openimis/fe-core", async () => vi.importActual("@openimis/fe-core/helpers/api"));

const { default: reducer } = await import("./reducer");
const { graphqlErrors, serverError } = await import("@openimis/fe-core/testing");

const initial = () => reducer(undefined, { type: "@@INIT" });
const dispatch = (state, type, { payload, meta } = {}) => reducer(state, { type, payload, meta });

const LISTS = [
    ["linked classes", "CALCULATION_LINKEDCLASSLIST", "LinkedClassList", (list) => ({
        linkedClass: { linkedClasses: list },
    })],
    ["calculation params", "CALCULATION_CALCULATIONPARAMSLIST", "CalculationParamsList", (list) => ({
        calculationParams: { calculationParams: list },
    })],
    ["calculation rules", "CALCULATION_CALCULATIONRULESLIST", "CalculationRulesList", (list) => ({
        calculationRules: { calculationRules: list },
    })],
];

const field = (suffix) => suffix.charAt(0).toLowerCase() + suffix.slice(1);

describe("calculation reducer", () => {
    it("returns the same state object for an unrelated action", () => {
        const state = initial();

        expect(reducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
    });

    it.each(LISTS)("empties the %s and marks them in flight when the request starts", (_label, type, suffix) => {
        const stale = { ...initial(), [field(suffix)]: [{ name: "stale" }], [`error${suffix}`]: { code: 500 } };
        const state = dispatch(stale, `${type}_REQ`);

        expect(state[field(suffix)]).toEqual([]);
        expect(state[`fetching${suffix}`]).toBe(true);
        expect(state[`fetched${suffix}`]).toBe(false);
        expect(state[`error${suffix}`]).toBeNull();
    });

    it.each(LISTS)("stores the %s the server returns", (_label, type, suffix, data) => {
        const list = [{ name: "a" }, { name: "b" }];
        const state = dispatch(dispatch(initial(), `${type}_REQ`), `${type}_RESP`, { payload: { data: data(list) } });

        expect(state[field(suffix)]).toEqual(list);
        expect(state[`fetching${suffix}`]).toBe(false);
        expect(state[`fetched${suffix}`]).toBe(true);
        expect(state[`error${suffix}`]).toBeNull();
    });

    it.each(LISTS)("reports a transport failure of the %s request", (_label, type, suffix) => {
        const state = dispatch(dispatch(initial(), `${type}_REQ`), `${type}_ERR`, {
            payload: serverError(500, "Internal Server Error", "boom"),
        });

        expect(state[`fetching${suffix}`]).toBe(false);
        expect(state[`error${suffix}`]).toEqual({ code: 500, message: "Internal Server Error", detail: "boom" });
    });

    it.each([
        ["linked classes", "CALCULATION_LINKEDCLASSLIST", "LinkedClassList", "linkedClass"],
        ["calculation rules", "CALCULATION_CALCULATIONRULESLIST", "CalculationRulesList", "calculationRules"],
    ])("falls back to no %s and reports the GraphQL error when none come back", (_label, type, suffix, entity) => {
        const state = dispatch(initial(), `${type}_RESP`, {
            payload: { data: { [entity]: null }, ...graphqlErrors("not allowed") },
        });

        expect(state[field(suffix)]).toEqual([]);
        expect(state[`error${suffix}`]).toMatchObject({ detail: "not allowed" });
    });

    // Currently fails: unlike the other two lists, the params response reads
    // calculationParams.calculationParams unguarded, so a null result throws a TypeError
    // instead of recording the error that came with it.
    it.fails("reports the GraphQL error when no calculation params come back", () => {
        const state = dispatch(initial(), "CALCULATION_CALCULATIONPARAMSLIST_RESP", {
            payload: { data: { calculationParams: null }, ...graphqlErrors("not allowed") },
        });

        expect(state.errorCalculationParamsList).toMatchObject({ detail: "not allowed" });
    });

    it("remembers which entity the calculation params were requested for", () => {
        const state = dispatch(initial(), "CALCULATION_CALCULATIONPARAMSLIST_RESP", {
            payload: { data: { calculationParams: { calculationParams: [{ name: "rate" }] } } },
            meta: { requestLabel: "ContractDetails-PolicyHolder-ph-1" },
        });

        expect(state.calculationParamsListRequestLabel).toBe("ContractDetails-PolicyHolder-ph-1");
    });
});
