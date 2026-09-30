import {
    afterEach, describe, expect, it, vi,
} from "vitest";

// Only fe-core's dispatcher is stubbed; formatQuery is real, imported from its defining
// module because fe-core's barrel imports itself.
const core = vi.hoisted(() => ({
    graphql: vi.fn((payload, type, meta) => ({ payload, type, meta })),
}));

vi.mock("@openimis/fe-core", async () => ({
    ...(await vi.importActual("@openimis/fe-core/helpers/api")),
    ...core,
}));

const actions = await import("./actions");

const query = (result) => result.payload.replace(/\s+/g, " ");

afterEach(() => {
    window.history.pushState({}, "", "/");
});

describe("calculation actions", () => {
    it("asks which classes are linked to a calculation class", () => {
        const result = actions.fetchLinkedClassList("ContractDetails");

        expect(result.type).toBe("CALCULATION_LINKEDCLASSLIST");
        expect(query(result)).toContain('linkedClass(classNameList: ["ContractDetails"]) { linkedClasses }');
    });

    it("asks for the params of one entity and labels the request with it", () => {
        const result = actions.fetchCalculationParamsList("ContractDetails", "PolicyHolder", "ph-1");

        expect(result.type).toBe("CALCULATION_CALCULATIONPARAMSLIST");
        expect(query(result))
            .toContain('calculationParams(className: "ContractDetails", instanceClassName: "PolicyHolder", instanceId: "ph-1")');
        expect(query(result)).toContain("optionSet{value, label{en, fr}}");
        expect(result.meta).toEqual({ requestLabel: "ContractDetails-PolicyHolder-ph-1" });
    });

    describe("fetching calculation rules", () => {
        it.each([
            ["a contribution plan bundle", "/front/contributionPlanBundles", undefined, "account_receivable"],
            ["a contribution plan", "/front/contributionPlans/contributionPlan/cp-1", undefined, "account_receivable"],
            ["a product payment plan", "/front/paymentPlans/paymentPlan", "product", "account_payable"],
            ["a benefit plan payment plan", "/front/paymentPlans/paymentPlan", "benefit plan", "social_protection"],
        ])("offers only the rules that fit %s", (_label, path, context, calcruleType) => {
            window.history.pushState({}, "", path);
            const result = actions.fetchCalculationRules([], context);

            expect(result.type).toBe("CALCULATION_CALCULATIONRULESLIST");
            expect(query(result)).toContain(`calculationRules(calcruleType: "${calcruleType}")`);
            expect(query(result)).toContain("calculationRules{uuid, calculationClassName, supportsAdvancedCriteria}");
        });

        it.each([
            ["a payment plan of no known type", "/front/paymentPlans", undefined],
            ["any other page", "/front/contracts", undefined],
        ])("offers every rule on %s", (_label, path, context) => {
            window.history.pushState({}, "", path);

            expect(query(actions.fetchCalculationRules([], context))).toContain("calculationRules {");
        });

        it("keeps the filters it was given", () => {
            window.history.pushState({}, "", "/front/contributionPlanBundles");

            expect(query(actions.fetchCalculationRules(['calculationClassName: "x"'])))
                .toContain('calculationRules(calculationClassName: "x",calcruleType: "account_receivable")');
        });
    });
});
