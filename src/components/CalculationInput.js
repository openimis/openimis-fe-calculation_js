import React, { Component } from "react";
import { decodeId, NumberInput, SelectInput } from "@openimis/fe-core";
import { FormControlLabel, Checkbox, Grid } from "@material-ui/core";
import { fetchLinkedClassList, fetchCalculationParamsList } from "../actions";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { BOOLEAN_TRUE, RIGHT_READ, JSON_EXT, CALCULATION_RULE } from "../constants";

class CalculationInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEntityReady: false,
            fetchedCalculationParamsList: false
        }
    }

    componentDidMount() {
        this.props.fetchLinkedClassList(this.props.className);
        this.setIsEntityReady();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.entity !== this.props.entity || prevProps.linkedClassList !== this.props.linkedClassList) {
            this.setIsEntityReady(prevProps);
        } else if (!!this.state.isEntityReady && !this.state.fetchedCalculationParamsList) {
            this.getCalculationParamsList();
        } else if (
            prevProps.calculationParamsList !== this.props.calculationParamsList &&
            !!this.props.calculationParamsList.length
        ) {
            this.setDefaultValue();
        }
    }

    setIsEntityReady = (prevProps = null) => {
        let isEntityReady = false;
        let refetchCalculationParamsList = false;
        if (!!this.props.entity && !!this.props.linkedClassList.length) {
            isEntityReady = true;
            this.props.linkedClassList.forEach((linkedClassName) => {
                const linkedClassKey = Object.keys(this.props.entity).find(
                    (k) => k.toLowerCase() === linkedClassName.toLowerCase()
                );
                if (!!this.props.entity[linkedClassKey]) {
                    if (
                        !!prevProps &&
                        !!prevProps.entity &&
                        JSON.stringify(prevProps.entity[linkedClassKey]) !==
                            JSON.stringify(this.props.entity[linkedClassKey])
                    ) {
                        refetchCalculationParamsList = true;
                    }
                } else {
                    isEntityReady = false;
                }
            });
        }
        this.setState(
            !!refetchCalculationParamsList ? { isEntityReady, fetchedCalculationParamsList: false } : { isEntityReady }
        );
    }

    getCalculationParamsList = () => {
        this.props.linkedClassList.forEach((linkedClassName) => {
            const instance = this.props.entity[
                Object.keys(this.props.entity).find((k) => k.toLowerCase() === linkedClassName.toLowerCase())
            ];
            if (!!instance && !!instance.id) {
                let instanceId;
                try {
                    instanceId = decodeId(instance.id);
                } catch (error) {
                    instanceId = instance.id;
                }
                this.props.fetchCalculationParamsList(this.props.className, linkedClassName, instanceId);
            }
        });
        this.setState({ fetchedCalculationParamsList: true });
    }

    setDefaultValue = () => {
        const defaultValue = !!this.props.value ? JSON.parse(this.props.value) : { [CALCULATION_RULE]: {} };
        let applyDefaultValue = false;
        this.props.calculationParamsList.forEach((input) => {
            if (
                !(
                    !!defaultValue &&
                    !!defaultValue[CALCULATION_RULE] &&
                    defaultValue[CALCULATION_RULE].hasOwnProperty(input.name)
                )
            ) {
                applyDefaultValue = true;
                switch (input.type) {
                    case "number":
                    case "select":
                        defaultValue[CALCULATION_RULE][input.name] = parseInt(input.defaultValue);
                        break;
                    case "checkbox":
                        defaultValue[CALCULATION_RULE][input.name] = input.defaultValue.toLowerCase() == BOOLEAN_TRUE;
                        break;
                }
            }
        });
        if (applyDefaultValue) {
            this.props.onChange(JSON_EXT, JSON.stringify(defaultValue));
        }
    }

    updateValue = (inputName, inputValue) => {
        const value = !!this.props.value && JSON.parse(this.props.value);
        if (!!value) {
            value[CALCULATION_RULE][inputName] = inputValue;
            this.props.onChange(JSON_EXT, JSON.stringify(value));
        }
    }

    inputs = () => {
        const { intl, rights, requiredRights, readOnly, calculationParamsList } = this.props;
        const inputs = [];
        const value = !!this.props.value ? JSON.parse(this.props.value)[CALCULATION_RULE] : null;
        this.state.fetchedCalculationParamsList &&
            calculationParamsList.forEach((input) => {
                if (
                    !!rights &&
                    !!input.rights &&
                    !!input.rights[RIGHT_READ] &&
                    rights.includes(Number(input.rights[RIGHT_READ]))
                ) {
                    const hasRequiredRights =
                        !!requiredRights &&
                        Array.isArray(requiredRights) &&
                        requiredRights.every((r) => rights.includes(Number(input.rights[r])));
                    switch (input.type) {
                        case "number":
                            if (!!value && value.hasOwnProperty(input.name)) {
                                inputs.push(
                                    <NumberInput
                                        key={input.name}
                                        label={input.label[intl.locale]}
                                        value={value[input.name]}
                                        onChange={(v) => this.updateValue(input.name, v)}
                                        readOnly={readOnly || !hasRequiredRights}
                                    />
                                );
                            }
                            break;
                        case "checkbox":
                            if (!!value && value.hasOwnProperty(input.name)) {
                                inputs.push(
                                    <FormControlLabel
                                        key={input.name}
                                        label={input.label[intl.locale]}
                                        control={
                                            <Checkbox
                                                checked={value[input.name]}
                                                onChange={(event) => this.updateValue(input.name, event.target.checked)}
                                                name={input.name}
                                                disabled={readOnly || !hasRequiredRights}
                                            />
                                        }
                                    />
                                );
                            }
                            break;
                        case "select":
                            if (!!value && value.hasOwnProperty(input.name)) {
                                const options = [
                                    ...input.optionSet.map((option) => ({
                                        value: parseInt(option.value),
                                        label: option.label[intl.locale]
                                    }))
                                ];
                                inputs.push(
                                    <SelectInput
                                        key={input.name}
                                        label={input.label[intl.locale]}
                                        options={options}
                                        value={value[input.name]}
                                        onChange={(v) => this.updateValue(input.name, v)}
                                        readOnly={readOnly || !hasRequiredRights}
                                    />
                                );
                            }
                            break;
                    }
                }
            });
        return inputs;
    }

    render() {
        return this.inputs().map((input) => (
            <Grid item xs={this.props.gridItemSize} className={this.props.gridItemStyle} key={input.key}>
                {input}
            </Grid>
        ));
    }
}

const mapStateToProps = state => ({
    linkedClassList: state.calculation.linkedClassList,
    calculationParamsList: state.calculation.calculationParamsList,
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : []
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchLinkedClassList, fetchCalculationParamsList }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(CalculationInput);
