import React, { Component } from "react";
import { decodeId, NumberInput, SelectInput } from "@openimis/fe-core";
import { FormControlLabel, Checkbox, Grid } from "@material-ui/core";
import { fetchLinkedClassList, fetchCalculationParamsList } from "../actions";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { BOOLEAN_TRUE, RIGHT_READ, JSON_EXT } from "../constants";

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
        if (
            !this.state.fetchedCalculationParamsList &&
            (prevProps.entity !== this.props.entity || prevProps.linkedClassList !== this.props.linkedClassList)
        ) {
            this.setIsEntityReady();
        } else if (!!this.state.isEntityReady && !this.state.fetchedCalculationParamsList) {
            this.getCalculationParamsList();
        }
    }

    setIsEntityReady = () => {
        let isEntityReady = false;
        if (!!this.props.entity && !!this.props.linkedClassList.length) {
            isEntityReady = true;
            this.props.linkedClassList.forEach((linkedClassName) => {
                if (!this.props.entity[
                    Object.keys(this.props.entity).find((k) => k.toLowerCase() === linkedClassName.toLowerCase())
                ]) {
                    isEntityReady = false;
                }
            });
        }
        this.setState({ isEntityReady });
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

    updateValue = (inputName, inputValue) => {
        const value = this.props.value ? JSON.parse(this.props.value) : {};
        value[inputName] = inputValue;
        this.props.onChange(JSON_EXT, JSON.stringify(value));
    }

    inputs = () => {
        const inputs = [];
        this.state.fetchedCalculationParamsList &&
            this.props.calculationParamsList.forEach((input) => {
                if (
                    !!this.props.rights &&
                    !!input.rights &&
                    !!input.rights[RIGHT_READ] &&
                    this.props.rights.includes(Number(input.rights[RIGHT_READ]))
                ) {
                    const hasRequiredRights =
                        !!this.props.requiredRights &&
                        Array.isArray(this.props.requiredRights) &&
                        this.props.requiredRights.every((r) => this.props.rights.includes(Number(input.rights[r])));
                    switch (input.type) {
                        case "number":
                            inputs.push(
                                <NumberInput
                                    key={input.name}
                                    label={input.label[this.props.intl.locale]}
                                    value={
                                        !!this.props.value && !!JSON.parse(this.props.value)[input.name]
                                            ? JSON.parse(this.props.value)[input.name]
                                            : input.defaultValue
                                    }
                                    onChange={(v) => this.updateValue(input.name, v)}
                                    readOnly={this.props.readOnly || !hasRequiredRights}
                                />
                            );
                            break;
                        case "checkbox":
                            inputs.push(
                                <FormControlLabel
                                    key={input.name}
                                    label={input.label[this.props.intl.locale]}
                                    control={
                                        <Checkbox
                                            checked={
                                                !!this.props.value && !!JSON.parse(this.props.value)[input.name]
                                                    ? JSON.parse(this.props.value)[input.name]
                                                    : input.defaultValue.toLowerCase() == BOOLEAN_TRUE
                                            }
                                            onChange={(event) => this.updateValue(input.name, event.target.checked)}
                                            name={input.name}
                                            disabled={this.props.readOnly || !hasRequiredRights}
                                        />
                                    }
                                />
                            );
                            break;
                        case "select":
                            const options = [
                                ...input.optionSet.map((option) => ({
                                    value: parseInt(option.value),
                                    label: option.label[this.props.intl.locale]
                                }))
                            ];
                            inputs.push(
                                <SelectInput
                                    key={input.name}
                                    label={input.label[this.props.intl.locale]}
                                    options={options}
                                    value={
                                        !!this.props.value && !!JSON.parse(this.props.value)[input.name]
                                            ? JSON.parse(this.props.value)[input.name]
                                            : parseInt(input.defaultValue)
                                    }
                                    onChange={(v) => this.updateValue(input.name, v)}
                                    readOnly={this.props.readOnly || !hasRequiredRights}
                                />
                            )
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
