import Autocomplete from '@material-ui/lab/Autocomplete';
import { RadioGroup, TextField } from '@mui/material';
import styled from 'styled-components';



export const StyledSearchField = styled(Autocomplete)`
	display: flex !important;
	margin-bottom: 16px !important;

	fieldset {
		border-color: rgb(217, 217, 217) !important
	}

`


export const StyledAddressSearchContainer = styled.div`
	padding: 12px 16px !important;

`
export const StyledRadioContainer = styled.div`
	// border: 2px solid red;
	// overflow-y: scroll;
	//  max-height: 500px;

`


export const StyledTextField = styled(TextField)`
	fieldset {
		border-color: rgb(217, 217, 217) !important;
	}
`

export const RadioElementContainerSelectMachine = styled.div`
	width: 100% !important;
	gap: 12px !important;
	display: flex;
	flex-direction:row;
	justify-content: space-between;
	align-items: center;
	label {
		display: flex;
		gap: 20px !important;
		margin-left: 10px !important;
	}
`

export const StyledRadioGroupSelectMachine = styled(RadioGroup)`
	display:flex;
	flex-direction: column;
	gap:12px !important;

`