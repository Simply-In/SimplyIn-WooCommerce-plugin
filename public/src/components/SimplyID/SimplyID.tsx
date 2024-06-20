import { useState, useEffect, ChangeEvent, createContext, useMemo } from "react";
import { z } from 'zod'
import { useTranslation } from "react-i18next";
import { SimplyinSmsPopupOpenerIcon } from "../../assets/SimplyinSmsPopupOpenerIcon.tsx";
import { SimplyinContainer, } from "./SimplyID.styled";
import { middlewareApi } from '../../services/middlewareApi.ts'
import { debounce } from 'lodash';
import { changeInputValue, simplyinTokenInputField } from "./steps/Step1.tsx";
import { useSelectedSimplyData } from "../../hooks/useSelectedSimplyData.ts";
import PinCodeModal from "./PinCodeModal.tsx";
import { useAuth } from "../../hooks/useAuth.ts";
import { saveDataSessionStorage } from "../../services/sessionStorageApi.ts";
import { predefinedFill } from "./steps/functions.ts";


import { useCounterData } from "../../hooks/useCounterData.ts";

export const ApiContext = createContext<any>(null);
export const SelectedDataContext = createContext<any>(null);
export const CounterContext = createContext<any>({});

export const shortLang = (lang: string) => lang.substring(0, 2).toUpperCase();
export const isValidEmail = (email: string) => z.string().email().safeParse(email).success

export type TypedLoginType = "pinCode" | "app" | undefined
//main simply app - email field
export const SimplyID = () => {
	const [modalStep, setModalStep] = useState<1 | 2 | "rejected">(1)
	const [userData, setUserData] = useState({})
	const { t } = useTranslation();
	const [simplyInput, setSimplyInput] = useState("");
	const [attributeObject, setAttributeObject] = useState({});
	const [visible, setVisible] = useState<boolean>(true)
	const [phoneNumber, setPhoneNumber] = useState("")
	const [notificationTokenId, setNotificationTokenId] = useState("")
	const [selectedUserData, setSelectedUserData] = useState({})
	const { i18n } = useTranslation();

	const [loginType, setLoginType] = useState<TypedLoginType>()
	const [counter, setCounter] = useState(0)
	const { authToken, setAuthToken } = useAuth()
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

	const {
		countdown,
		setCountdown,
		countdownError,
		setCountdownError,
		errorPinCode,
		setErrorPinCode,
		modalError,
		setModalError,
		countdownTime,
		setCountdownTime,
		countdownTimeError,
		setCountdownTimeError
	} = useCounterData();


	useEffect(() => {
		const SimplyInput = document.getElementById("billing_email") || document.getElementById("email");
		SimplyInput?.remove();
		const attributes: any = SimplyInput?.attributes;
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

	const handleClosePopup = () => {
		setVisible(false)
	}

	const maxAttempts = 180 * 1000 / 500; // 60 seconds divided by 500ms

	useEffect(() => {

		if (!notificationTokenId || modalStep !== 1) {
			return
		}

		middlewareApi({
			endpoint: "checkout/checkIfSubmitEmailPushNotificationWasConfirmed",
			method: 'POST',
			requestBody: { "email": simplyInput.trim().toLowerCase(), "notificationTokenId": notificationTokenId, language: shortLang(i18n.language) }
		})
			.then(({ ok, rejected, authToken, userData }) => {
				if (authToken) {
					setAuthToken(authToken)
					saveDataSessionStorage({ key: 'simplyinToken', data: authToken })
					changeInputValue(simplyinTokenInputField, authToken);
				}
				if (ok) {


					const newData = { ...userData }
					if (newData?.createdAt) {
						delete newData.createdAt
					}
					if (newData?.updatedAt) {
						delete newData.updatedAt
					}

					setUserData(newData)

					if (userData?.language) {
						i18n.changeLanguage(userData?.language.toLowerCase())
					}

					saveDataSessionStorage({ key: 'UserData', data: newData })

					setVisible(true)
					setModalStep(2)

					predefinedFill(newData, handleClosePopup, {
						setSelectedBillingIndex,
						setSelectedShippingIndex,
						setSelectedDeliveryPointIndex,
						setSameDeliveryAddress,
						setPickupPointDelivery,
						setSelectedUserData
					})
				} else if (ok === false && rejected === true) {
					setVisible(true)
					setModalStep("rejected")
				}
				else if (counter < maxAttempts) {
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

		if (!authToken) {
			const debouncedRequest = debounce(() => {
				if (isValidEmail(simplyInput.trim().toLowerCase())) {
					middlewareApi({
						endpoint: "checkout/submitEmail",
						method: 'POST',
						requestBody: { "email": simplyInput.trim().toLowerCase(), language: shortLang(i18n.language) }
					}).then(({ data: phoneNumber, userUsedPushNotifications, notificationTokenId }) => {


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
						.catch((err) => {
							console.log('my err', err);
						})
				}
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
			setAuthToken((simplyinTokenInput as HTMLInputElement)?.value)
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


	const counterProps = useMemo(() => {
		return {
			countdown,
			setCountdown,
			countdownError,
			setCountdownError,
			errorPinCode,
			setErrorPinCode,
			modalError,
			setModalError,
			countdownTime,
			setCountdownTime,
			countdownTimeError,
			setCountdownTimeError
		}
	}, [countdown,
		setCountdown,
		countdownError,
		setCountdownError,
		errorPinCode,
		setErrorPinCode,
		modalError,
		setModalError,
		countdownTime,
		setCountdownTime,
		countdownTimeError,
		setCountdownTimeError])


	return (
		<ApiContext.Provider value={{ authToken, setAuthToken }}>
			<SelectedDataContext.Provider value={providerProps}>
				<CounterContext.Provider value={counterProps}>

					<div className="REACT_APP">
						<SimplyinContainer>
							<input autoComplete="off"
								{...attributeObject}
								value={simplyInput}
								onChange={handleSimplyInputChange}
								type="email"
								placeholder={t('emailPlaceholder')}

							></input>


							{phoneNumber && <SimplyinSmsPopupOpenerIcon onClick={handleOpenSmsPopup} token={authToken} />}
						</SimplyinContainer>

						{phoneNumber && <PinCodeModal

							selectedUserData={selectedUserData}
							setSelectedUserData={setSelectedUserData}
							modalStep={modalStep}
							setModalStep={setModalStep}
							userData={userData}
							setUserData={setUserData}
							simplyInput={simplyInput}
							setToken={setAuthToken}
							phoneNumber={phoneNumber}
							visible={visible}
							setVisible={setVisible}
							loginType={loginType}
							setLoginType={setLoginType}
							setNotificationTokenId={setNotificationTokenId}
						/>}
					</div >
				</CounterContext.Provider>
			</SelectedDataContext.Provider>
		</ApiContext.Provider>
	);
};


export default SimplyID