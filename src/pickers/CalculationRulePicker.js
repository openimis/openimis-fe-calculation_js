import React, { Component } from "react";
import { SelectInput } from "@openimis/fe-core";
import { fetchCalculationRules } from "../actions"
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

class CalculationRulePicker extends Component {
    componentDidMount() {
        this.props.fetchCalculationRules([], this.props.context);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.context !== prevProps.context) {
            this.props.fetchCalculationRules([], this.props.context);
        }
    }

    render() {
        const {
            label,
            value,
            required,
            readOnly,
            withNull = false,
            nullLabel = null,
            onChange,
            calculationRulesList,
            context
        } = this.props;
        let options = [
            ...calculationRulesList.map((calculationRule) => ({
                value: calculationRule.uuid,
                label: calculationRule.calculationClassName
            }))
        ];
        if (withNull) {
            options.unshift({
                value: null,
                label: nullLabel || ""
            })
        }

        return (
            <SelectInput
                label={label}
                options={options}
                value={value}
                onChange={(v) => onChange("calculation", v)}
                required={required}
                readOnly={readOnly}
            />
        )
    }
}

const mapStateToProps = state => ({
    calculationRulesList: state.calculation.calculationRulesList
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchCalculationRules }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(CalculationRulePicker);
