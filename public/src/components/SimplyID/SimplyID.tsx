import { useState, useEffect, ChangeEvent, createContext, useMemo } from "react";
import { SimplyinSmsPopupOpenerIcon } from "../../assets/SimplyinSmsPopupOpenerIcon.tsx";
import { SimplyinContainer, } from "./SimplyID.styled";
import { middlewareApi } from '../../services/middlewareApi.ts'
import { debounce } from 'lodash';
import { changeInputValue, simplyinTokenInputField } from "./steps/Step1.tsx";
import { useSelectedSimplyData } from "../../hooks/useSelectedSimplyData.ts";
import PinCodeModal from "./PinCodeModal.tsx";
import { useTranslation } from "react-i18next";




export const ApiContext = createContext("");
export const SelectedDataContext = createContext<any>(null);

export const SimplyID = () => {
	const { t } = useTranslation();

	const [simplyInput, setSimplyInput] = useState("");
	const [attributeObject, setAttributeObject] = useState({});
	const [visible, setVisible] = useState<boolean>(true)
	const [phoneNumber, setPhoneNumber] = useState("")
	const [token, setToken] = useState("")

	const {
		selectedBillingIndex,
		setSelectedBillingIndex,

		selectedShippingIndex,
		setSelectedShippingIndex,

		sameDeliveryAddress,
		setSameDeliveryAddress,

		selectedDeliveryPointIndex,
		setSelectedDeliveryPointIndex,

		pickupPointDelivery,
		setPickupPointDelivery

	} = useSelectedSimplyData();


	useEffect(() => {
		const YodaInput = document.getElementById("billing_email") || document.getElementById("email");

		// console.log('YodaInput', YodaInput);
		YodaInput?.remove();

		const attributes: any = YodaInput?.attributes;
		const attributeKeeper: any = {};
		for (let i = 0; i < attributes.length; i++) {
			const attributeName = attributes[i].name;
			const attributeValue = attributes[i].value;
			attributeKeeper[attributeName] = attributeValue;
		}
		setAttributeObject(attributeKeeper);

		// setSimplyInput(attributeKeeper?.value || "")
	}, []);


	const handleOpenSmsPopup = () => {
		setVisible((prev) => !prev)
	};

	const handleSimplyInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSimplyInput(e.target.value)
		sessionStorage.removeItem("simplyinToken")
		sessionStorage.removeItem("UserData")
	}

	useEffect(() => {
		setVisible(false)
		setPhoneNumber("")
		changeInputValue(simplyinTokenInputField, "");

		setSelectedBillingIndex(0)
		setSelectedShippingIndex(null)
		setSelectedDeliveryPointIndex(null)

		if (!token) {
			const debouncedRequest = debounce(() => {
				middlewareApi({
					endpoint: "checkout/submitEmail",
					method: 'POST',
					requestBody: { "email": simplyInput.trim().toLowerCase() }
				}).then(res => {

					setPhoneNumber(res.data)
					setVisible(true)
					console.log(res)

					if (res.error) {

						console.log('error', res.error);
					}
				}).catch((err) => {
					console.log(err);
				})
			}, 500);

			debouncedRequest();
			return () => {
				debouncedRequest.cancel();
			};

		}
	}, [simplyInput]);




	useEffect(() => {

		const simplyinTokenInput = document.getElementById('simplyinTokenInput');
		const handleSimplyTokenChange = () => {
			setToken((simplyinTokenInput as HTMLInputElement)?.value)
		}


		simplyinTokenInput?.addEventListener('input', handleSimplyTokenChange);

		return () => {
			simplyinTokenInput?.removeEventListener('input', handleSimplyTokenChange);

		};
	}, [])

	const providerProps = useMemo(() => {
		return {
			selectedBillingIndex,
			setSelectedBillingIndex,
			selectedShippingIndex,
			setSelectedShippingIndex,
			sameDeliveryAddress,
			setSameDeliveryAddress,
			selectedDeliveryPointIndex,
			setSelectedDeliveryPointIndex,
			pickupPointDelivery,
			setPickupPointDelivery
		}
	}, [selectedBillingIndex,
		setSelectedBillingIndex,
		selectedShippingIndex,
		setSelectedShippingIndex,
		sameDeliveryAddress,
		setSameDeliveryAddress,
		selectedDeliveryPointIndex,
		setSelectedDeliveryPointIndex,
		pickupPointDelivery,
		setPickupPointDelivery])

	return (
		<ApiContext.Provider value={token}>
			<SelectedDataContext.Provider value={providerProps}>
				<div className="REACT_APP">
					<SimplyinContainer>
						<input autoComplete="off"
							{...attributeObject}
							value={simplyInput}
							onChange={handleSimplyInputChange}
							type="email"
							placeholder={t('emailPlaceholder')}

						></input>


						{phoneNumber && <SimplyinSmsPopupOpenerIcon onClick={handleOpenSmsPopup} token={token} />}
					</SimplyinContainer>

					{phoneNumber && <PinCodeModal
						simplyInput={simplyInput}
						setToken={setToken}
						phoneNumber={phoneNumber}
						visible={visible}
						setVisible={setVisible}


					/>}
				</div >
			</SelectedDataContext.Provider>
		</ApiContext.Provider>
	);
};


export default SimplyID