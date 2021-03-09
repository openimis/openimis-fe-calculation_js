# openIMIS Frontend Calculation module
This repository holds the files of the openIMIS Frontend Calculation reference module.
It is dedicated to be deployed as a module of [openimis-fe_js](https://github.com/openimis/openimis-fe_js).

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## Main Menu Contributions
None

## Other Contributions
* `contract.ContractDetails.calculation`: display parameters required by multiple calculations for an object
* `policyHolder.PolicyHolderInsuree.calculation`: display parameters required by multiple calculations for an object
* `contributionPlan.ContributionPlan.calculation`: display parameters required by multiple calculations for an object

## Available Contribution Points
None

## Published Components
None

## Dispatched Redux Actions
* `CALCULATION_LINKEDCLASSLIST_{REQ|RESP|ERR}`, fetching linked classes to be used for fetching calculation parameters
* `CALCULATION_CALCULATIONPARAMSLIST_{REQ|RESP|ERR}`, fetching calculation parameters

## Other Modules Listened Redux Actions
None

## Other Modules Redux State Bindings
* `state.core.user`, to access user info (rights,...)

## Configurations Options
None
