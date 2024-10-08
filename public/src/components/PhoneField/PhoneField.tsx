
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



//Function to rendering and validate phone number input
export const PhoneField = ({ defaultRegister }: { defaultRegister: boolean }) => {
	const [attributeObject, setAttributeObject] = useState<unknown>({});
	const [phoneInput, setPhoneInput] = useState<string>("");
	const [checked, setChecked] = useState(defaultRegister);
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


		const billingPhoneField = document.getElementById('billing_phone') as HTMLInputElement;

		if (billingPhoneField) {
			billingPhoneField.addEventListener('input', function singlePhoneNumberChange() {
				if (billingPhoneField.value) {
					const countrySelect = document.getElementById('billing_country') as HTMLSelectElement;
					const countryCode = countrySelect?.value || "PL"; // Default to "PL" if not available

					const selectedCountryNumber = parsePhoneNumber(billingPhoneField.value, countryCode as Country || "PL")
					if (selectedCountryNumber?.nationalNumber && selectedCountryNumber?.nationalNumber?.length > 8) {
						if (isValidPhoneNumber(selectedCountryNumber?.number)) {
							setCountryCode(countryCode as Country);
							setPhoneInput(selectedCountryNumber.number);
							billingPhoneField.removeEventListener("input", singlePhoneNumberChange);
						}
					}

				}
			});
		}


	}, []);


	useEffect(() => {
		const handlePhoneNumber = () => {
			const phoneInputField = document.getElementById("billing_phone") as HTMLInputElement;
			const phoneVal = phoneInputField?.value.replace(/^00|^0/, '+') || "";

			if (!phoneVal) return;

			try {
				if (isValidPhoneNumber(phoneVal)) {
					setPhoneInput(phoneVal);
					setError(""); // Reset error if phone number is valid
			} else if (phoneVal.startsWith("+")) {
				  setPhoneInput(phoneVal);
				setError(t("payment.checkPhoneNumber"));
			} else {
					handleInvalidPhoneNumber(phoneVal);
				}
			} catch (err) {
				setError(t('payment.phoneNumberError'));
				console.error('Error:', err);
			}
		};

		const handleInvalidPhoneNumber = (phoneVal: string) => {
			const countrySelect = document.getElementById('billing_country') as HTMLSelectElement;
			const countryCode = countrySelect?.value || "PL";

			const selectedCountryNumber = parsePhoneNumber(phoneVal, countryCode as Country || "PL");

			if (!selectedCountryNumber) {
				return;
			}

			setCountryCode(countryCode as Country);
			setPhoneInput(selectedCountryNumber.number || "");

			if (!isValidPhoneNumber(selectedCountryNumber.number || "") && phoneVal) {
				setError(t("payment.checkPhoneNumber"));
			}
		};

		handlePhoneNumber();
		checkedRef.current = true;

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [attributeObject, checked]);

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
							id="checkbox-container-flex"
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
					name="phoneAppInputField"
					id="phoneAppInputField"
					style={{ padding: 5 }}
					autocomplete="off"
					international
					countryCallingCodeEditable={false}
					defaultCountry={countryCode || "PL"}
					value={phoneInput}
					//@ts-ignore
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
					{t('payment.createAccountDescription-3')} <PhoneInputDescriptionLink target="_blank" href="https://simply.in/terms-b2c">{" "}{t('payment.createAccountDescription-4')}
						{" "}Simply.In.{" "}</PhoneInputDescriptionLink >
					{t('payment.createAccountDescription-5')}
					<PhoneInputDescriptionLink target="_blank" href="https://simply.in/">{" "}Simply.In.</PhoneInputDescriptionLink>
					{t('payment.createAccountDescription-6')}
					<PhoneInputDescriptionLink target="_blank" href="https://simply.in/privacy-policy">{" "}{t('payment.createAccountDescription-7')} </PhoneInputDescriptionLink>
				</PhoneInputDescriptionSecondary>
				{/*  */}

			</>}
		</>
		}
	</>
	)
}

export default PhoneField
