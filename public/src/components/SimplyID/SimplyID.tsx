import { useState, useEffect, ChangeEvent, createContext, useMemo, useCallback } from "react";
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


export type TypedLoginType = "pinCode" | "app" | undefined
//main simply app - email field
export const SimplyID = () => {
	const [modalStep, setModalStep] = useState(1)
	const [userData, setUserData] = useState({})
	const { t } = useTranslation();
	const [simplyInput, setSimplyInput] = useState("");
	const [attributeObject, setAttributeObject] = useState({});
	const [visible, setVisible] = useState<boolean>(true)
	const [phoneNumber, setPhoneNumber] = useState("")
	const [token, setToken] = useState("")
	const [notificationTokenId, setNotificationTokenId] = useState("")

	const [loginType, setLoginType] = useState<TypedLoginType>()
	const [counter, setCounter] = useState(0)

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
		YodaInput?.remove();
		const attributes: any = YodaInput?.attributes;
		const attributeKeeper: any = {};
		for (const attribute of attributes) {
			const attributeName = attribute.name;
			const attributeValue = attribute.value;
			attributeKeeper[attributeName] = attributeValue;
		}
		setAttributeObject(attributeKeeper);


	}, []);


	//opening simply modal
	const handleOpenSmsPopup = () => {
		setVisible((prev) => !prev)
	};

	//handling simply email field change 
	const handleSimplyInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSimplyInput(e.target.value)
		sessionStorage.removeItem("simplyinToken")
		sessionStorage.removeItem("UserData")
	}

	const maxAttempts = 30 * 1000 / 500; // 30 seconds divided by 500ms

	useEffect(() => {
		console.log({ notificationTokenId, modalStep, visible })
		// if (!notificationTokenId || modalStep !== 1 || !visible) {
		if (!notificationTokenId || modalStep !== 1) {
			console.log('return');
			return
		}

		console.log('current counter', counter);
		middlewareApi({
			endpoint: "checkout/checkIfSubmitEmailPushNotificationWasConfirmed",
			method: 'POST',
			requestBody: { "email": simplyInput.trim().toLowerCase(), "notificationTokenId": notificationTokenId, language: "EN" }
		})
			.then((data) => {
				console.log('data request', data);

				if (data?.ok) {
					setUserData(data?.userData)
					setVisible(true)
					setModalStep(2)
					console.log('Login accepted');
				} else if (counter < maxAttempts) {

					setTimeout(() => setCounter((prev) => prev + 1), 1000);
				} else {
					console.log('Login not accepted within 30 seconds');
				}
			})
			.catch(error => {
				console.error('Error checking login status:', error);
			});


	}, [notificationTokenId, counter, visible])


	useEffect(() => {
		setVisible(false)
		setPhoneNumber("")
		changeInputValue(simplyinTokenInputField, "");

		setSelectedBillingIndex(0)
		setSelectedShippingIndex(null)
		setSelectedDeliveryPointIndex(null)
		setNotificationTokenId("")

		if (!token) {
			const debouncedRequest = debounce(() => {
				middlewareApi({
					endpoint: "checkout/submitEmail",
					method: 'POST',
					requestBody: { "email": simplyInput.trim().toLowerCase() }
				}).then(({ data: phoneNumber, userUsedPushNotifications, notificationTokenId }) => {

					console.log(userUsedPushNotifications);

					setPhoneNumber(phoneNumber)
					setVisible(true)

					setLoginType(userUsedPushNotifications ? "app" : "pinCode")

					if (userUsedPushNotifications) {
						setNotificationTokenId(notificationTokenId)
						// isLoginAccepted(notificationTokenId)
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
						modalStep={modalStep}
						setModalStep={setModalStep}
						userData={userData}
						setUserData={setUserData}
						simplyInput={simplyInput}
						setToken={setToken}
						phoneNumber={phoneNumber}
						visible={visible}
						setVisible={setVisible}
						loginType={loginType}


					/>}
				</div >
			</SelectedDataContext.Provider>
		</ApiContext.Provider>
	);
};


export default SimplyID