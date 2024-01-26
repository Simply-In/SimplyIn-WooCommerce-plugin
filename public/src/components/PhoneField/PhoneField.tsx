
import { Checkbox, Divider } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CheckboxContainer, CheckboxLabel, PhoneInputDescription, PhoneInputDescriptionLink, PhoneInputDescriptionSecondary } from "./PhoneField.styled";
import { debounce } from "lodash";

import PhoneInput, { Country, isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { removeDataSessionStorage, saveDataSessionStorage } from "../../services/sessionStorageApi";
import { SimplyInFullLogo } from "../../assets/SimplyInFullLogo";

const MyCustomInput = React.forwardRef((props, ref: any) => (
	<div style={{ display: 'flex', flex: "1 1 auto" }}>
		<input ref={ref} {...props} className="input-text" style={{ flex: "1 1 auto" }} />
	</div>
))

export const PhoneField = () => {
	const [attributeObject, setAttributeObject] = useState<any>({});
	const [phoneInput, setPhoneInput] = useState<string>("");
	const [checked, setChecked] = useState(false);
	const [error, setError] = useState("")
	const [simplyinToken, setSimplyinToken] = useState<string>("")
	const checkedRef = useRef(false);

	const [countryCode, setCountryCode] = useState<Country>("PL")
	const handleChangeCheckbox = () => {
		setChecked((prev) => !prev);

	};



	useEffect(() => {
		const phoneInputField = document.getElementById("billing_phone");
		const defaultCheckbox = document.getElementById("simply-save-checkbox_field")
		defaultCheckbox?.remove();

		const attributes: any = phoneInputField?.attributes;

		const attributeKeeper: any = {};
		for (let i = 0; i < attributes.length; i++) {
			const attributeName = attributes[i]?.name;
			const attributeValue = attributes[i]?.value;
			attributeKeeper[attributeName] = attributeValue;
		}
		setAttributeObject(attributeKeeper);


	}, []);


	useEffect(() => {
		// if (checked && !checkedRef.current) {
		setError("")
		const phoneInputField = document.getElementById("billing_phone") as HTMLInputElement

		//jesli ma 0 00 to zamieniane na +
		const phoneVal = phoneInputField?.value.replace(/^00|^0/, '+') || ""
		if (!phoneVal) return


		console.log('1', phoneVal);
		console.log('62', parsePhoneNumber(phoneVal) || "");
		console.log('check if valid', isValidPhoneNumber(phoneVal || ""));
		console.log(phoneVal);

		if (isValidPhoneNumber(phoneVal || "")) {
			console.log("warunek 1");
			setPhoneInput(phoneVal || "")
		} else {


			if (phoneVal.startsWith("+")) {
				console.log("wartunek 2")
				setPhoneInput(phoneVal || "")
				setError("Sprawdź poprawność wprowadzonego numeru")
			} else {

				try {
					console.log("warunek 3 ");

				// kod z wybranego kraju lub deafultowy
				const countrySelect = document.getElementById('billing_country') as HTMLSelectElement 

				const countryCode = countrySelect?.options[countrySelect?.selectedIndex]?.value || "PL"
					console.log("countryCode", countryCode);

					const selectedCountryNumber = parsePhoneNumber(phoneInputField?.value, countryCode as Country || "PL")

					console.log(selectedCountryNumber);
					if (!selectedCountryNumber) {
						return
					}
				setCountryCode(countryCode as Country)

				setPhoneInput(selectedCountryNumber?.number || "")

				if (!isValidPhoneNumber(selectedCountryNumber?.number as string || "") && phoneVal) {

				// console.log('777 numer nieporpawny');
					setError("Sprawdź poprawność wprowadzonego numeru")
				}
				}
				catch (err) {
					setError("Wystąpił błąd, wprowadź numer ręcznie")
					console.log('błąd', err);
				}
			}


		}


		checkedRef.current = true;
		// }
	}, [attributeObject, checked])

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
			setError('Numer telefonu jest nieprawidłowy.');
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
			<CheckboxContainer>
				<Checkbox
					style={{ marginLeft: -11 }}
					id="simply-save-checkbox"
					name="simply-save-checkbox"
					checked={simplyinToken ? !!simplyinToken : checked}
					onChange={handleChangeCheckbox}
					inputProps={{ 'aria-label': 'controlled' }} />
				<CheckboxLabel onClick={() => handleChangeCheckbox()}>
					<span>Nowość!</span> Zapisz swoje dane w Simply.IN aby łatwo i prosto kupować w tym i w innych sklepach.
				</CheckboxLabel>
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
					Następnym razem, gdy dokonasz płatności tutaj lub w innych sklepach używających
					<PhoneInputDescriptionLink target="_blank" href="https://simply.in/">{" "}Simply.IN{" "}</PhoneInputDescriptionLink>
					, otrzymasz kod SMS-em i będziesz mógł bezpiecznie robić zakupy za pomocą

					{/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore */}
					<PhoneInputDescriptionLink target="_blank" href={appLocalizer?.base_url || "./"}>{" "}Simply.IN.</PhoneInputDescriptionLink>
				</PhoneInputDescription>
				<PhoneInputDescriptionSecondary>
					Klikając przycisk „Zamawiam” lub analogiczny, potwierdzam że zapoznałem się i akceptuję <PhoneInputDescriptionLink target="_blank" href="https://simply.in/terms-and-conditions">{" "}Regulamin
						{" "}Simply.In.{" "}</PhoneInputDescriptionLink >
					Administratorem Twoich danych osobowych jest
					<PhoneInputDescriptionLink target="_blank" href="https://simply.in/">{" "}Simply.In.</PhoneInputDescriptionLink>
					Zobacz więcej w
					<PhoneInputDescriptionLink target="_blank" href="https://simply.in/gdpr-rules">{" "}Polityce Prywatności. </PhoneInputDescriptionLink>
				</PhoneInputDescriptionSecondary>
				{/*  */}

			</>}
		</>
		}
	</>
	)
}

export default PhoneField
