
import { Checkbox, Divider, FormControl, FormControlLabel, FormGroup } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CheckboxContainer, CheckboxLabel, PhoneInputDescription, PhoneInputDescriptionLink, PhoneInputDescriptionSecondary } from "./PhoneField.styled";
import { debounce } from "lodash";

import PhoneInput, { Country, isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { removeDataSessionStorage, saveDataSessionStorage } from "../../services/sessionStorageApi";
import { SimplyInFullLogo } from "../../assets/SimplyInFullLogo";
import { useTranslation } from "react-i18next";


const MyCustomInput = React.forwardRef((props, ref: any) => (
	<div style={{ display: 'flex', flex: "1 1 auto" }}>
		<input ref={ref} {...props} className="input-text" style={{ flex: "1 1 auto" }} />
	</div>
))

export const PhoneField = () => {
	const [attributeObject, setAttributeObject] = useState<unknown>({});
	const [phoneInput, setPhoneInput] = useState<string>("");
	const [checked, setChecked] = useState(false);
	const [error, setError] = useState("")
	const [simplyinToken, setSimplyinToken] = useState<string>("")
	const checkedRef = useRef(false);

	const [countryCode, setCountryCode] = useState<Country>("PL")
	const { t } = useTranslation();

	const handleChangeCheckbox = () => {
		setChecked((prev) => !prev);
	};



	useEffect(() => {
		const phoneInputField = document.getElementById("billing_phone");
		const defaultCheckbox = document.getElementById("simply-save-checkbox_field")
		defaultCheckbox?.remove();

		const attributes: any = phoneInputField?.attributes;

		const attributeKeeper: any = {};
		for (const attribute of attributes) {
			const attributeName = attribute?.name;
			const attributeValue = attribute?.value;
			attributeKeeper[attributeName] = attributeValue;
		}
		setAttributeObject(attributeKeeper);


	}, []);


	useEffect(() => {

		setError("")
		const phoneInputField = document.getElementById("billing_phone") as HTMLInputElement

		//jesli ma 0 00 to zamieniane na +
		const phoneVal = phoneInputField?.value.replace(/^00|^0/, '+') || ""
		if (!phoneVal) return

		try {
			if (isValidPhoneNumber(phoneVal || "")) {
				// Condition 1: Valid phone number
				console.log("Condition 1");
				setPhoneInput(phoneVal || "");
			} else if (phoneVal.startsWith("+")) {
				// Condition 2: Phone number starts with '+'
				console.log("Condition 2");
				setPhoneInput(phoneVal || "");
				setError(t("payment.checkPhoneNumber"));
			} else {
				// Condition 3: Phone number does not start with '+' and is not valid
				console.log("Condition 3");

				// Retrieve the selected country code from the billing_country element
				const countrySelect = document.getElementById('billing_country') as HTMLSelectElement;
				const countryCode = countrySelect?.value || "PL"; // Default to "PL" if not available

				// Parse the phone number using the selected country code
				const selectedCountryNumber = parsePhoneNumber(phoneVal, countryCode as Country || "PL");

				if (!selectedCountryNumber) {
					// Invalid phone number for the selected country
					return;
				}

				// Set the country code and formatted phone input
				setCountryCode(countryCode as Country);
				setPhoneInput(selectedCountryNumber.number || "");

				if (!isValidPhoneNumber(selectedCountryNumber.number || "") && phoneVal) {
					// Invalid phone number for the selected country
					setError(t("payment.checkPhoneNumber"));
				}
			}
		} catch (err) {
			// Handle any unexpected errors
			setError(t('payment.phoneNumberError'));
			console.error('Error:', err);
		}
		checkedRef.current = true;
		// }
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [attributeObject, checked])

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedValidation = useCallback(
		debounce((number) => {
			validatePhoneNumber(number);
		}, 1000),
		[],
	);
	const phoneChange = (number: string) => {
		setPhoneInput(number)
		setError("")
		debouncedValidation(number);
	}

	const validatePhoneNumber = (number: string) => {
		if (isValidPhoneNumber(number || "") || !number) {
			setError('');
		} else {
			console.log('ERROR', number);
			setError(t('payment.phoneNumberIncorrect'));
		}
	}

	useEffect(() => {
		const simplyinTokenInput = document.getElementById('simplyinTokenInput');
		const handleSimplyTokenChange = () => {
			setSimplyinToken((simplyinTokenInput as HTMLInputElement)?.value)
		}

		simplyinTokenInput?.addEventListener('input', handleSimplyTokenChange);

		return () => {
			simplyinTokenInput?.removeEventListener('input', handleSimplyTokenChange);

		};
	}, [])


	useEffect(() => {
		const debouncedRequest = debounce(() => {

			if (checked && phoneInput && isValidPhoneNumber(phoneInput || "")) {
				saveDataSessionStorage({ key: "phoneInput", data: phoneInput })

			}

		}, 1500);

		debouncedRequest();
		return () => {
			debouncedRequest.cancel();
		};
	}, [phoneInput, checked])

	useEffect(() => {
		removeDataSessionStorage({ key: "simplyinToken" })
	}, [phoneInput])



	return (!simplyinToken && <>

		{!simplyinToken && <>
			<CheckboxContainer  >
				<FormControl sx={{}} component="fieldset" variant="standard">
					<FormGroup>
						<FormControlLabel
							control={
								<Checkbox 
									checked={simplyinToken ? !!simplyinToken : checked}
									onChange={handleChangeCheckbox} 
									id="simply-save-checkbox"
									name="simply-save-checkbox" />
							}
							label={<CheckboxLabel><span>{t('payment.paymentTitle-1')}</span> {t('payment.paymentTitle-2')}</CheckboxLabel>}
						/>
					</FormGroup>
				</FormControl>
			</CheckboxContainer>
			{checked && <>
				<SimplyInFullLogo style={{ marginBottom: "8px" }} />
				<PhoneInput
					style={{ padding: 5 }}
					autocomplete="off"
					international
					countryCallingCodeEditable={false}
					defaultCountry={countryCode || "PL"}
					value={phoneInput}
					onChange={phoneChange}
					inputComponent={MyCustomInput}

				/> {error && <div style={{ color: '#ff8000' }}>{error}</div>}
				<Divider style={{ marginTop: "16px", marginBottom: "16px" }} />
			</>}

			{checked && <>
				<PhoneInputDescription>
					{t('payment.createAccountDescription-1')}
					<PhoneInputDescriptionLink target="_blank" href="https://simply.in/">{" "}Simply.IN{" "}</PhoneInputDescriptionLink>
					{t('payment.createAccountDescription-2')}

					{/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore */}
					<PhoneInputDescriptionLink target="_blank" href={appLocalizer?.base_url || "./"}>{" "}Simply.IN.</PhoneInputDescriptionLink>
				</PhoneInputDescription>
				<PhoneInputDescriptionSecondary>
					{t('payment.createAccountDescription-3')} <PhoneInputDescriptionLink target="_blank" href="https://simply.in/terms-and-conditions">{" "}{t('payment.createAccountDescription-4')}
						{" "}Simply.In.{" "}</PhoneInputDescriptionLink >
					{t('payment.createAccountDescription-5')}
					<PhoneInputDescriptionLink target="_blank" href="https://simply.in/">{" "}Simply.In.</PhoneInputDescriptionLink>
					{t('payment.createAccountDescription-6')}
					<PhoneInputDescriptionLink target="_blank" href="https://simply.in/gdpr-rules">{" "}{t('payment.createAccountDescription-7')} </PhoneInputDescriptionLink>
				</PhoneInputDescriptionSecondary>
				{/*  */}

			</>}
		</>
		}
	</>
	)
}

export default PhoneField
