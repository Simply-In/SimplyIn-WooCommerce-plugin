import { useState, useEffect, ChangeEvent, createContext, useMemo } from "react";
import { z } from 'zod'
import { useTranslation } from "react-i18next";
import { SimplyinSmsPopupOpenerIcon } from "../../assets/SimplyinSmsPopupOpenerIcon.tsx";
import { SimplyinContainer, } from "./SimplyID.styled";
import { middlewareApi } from '../../services/middlewareApi.ts'
import { debounce } from 'lodash';
import { changeInputValue, simplyinTokenInputField } from "./steps/Step1.tsx";
import { isNumber, useSelectedSimplyData } from "../../hooks/useSelectedSimplyData.ts";
import PinCodeModal from "./PinCodeModal.tsx";
import { useAuth } from "../../hooks/useAuth.ts";
import { loadDataFromSessionStorage, saveDataSessionStorage } from "../../services/sessionStorageApi.ts";
import { predefinedFill } from "./steps/functions.ts";


import { useCounterData } from "../../hooks/useCounterData.ts";
import { TabType } from "./steps/Step2.tsx";

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
	const [downloadIconsAllowed, setDownloadIconsAllowed] = useState(true)

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
		setPickupPointDelivery,
		selectedTab,
		setSelectedTab,
		deliveryType,
		setDeliveryType


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


	useEffect(() => {

		//event on visibility change (visible modal)
		if (visible === false) {


			const BillingIndex = (loadDataFromSessionStorage({ key: "BillingIndex" }) || 0) as number
			const ShippingIndex = loadDataFromSessionStorage({ key: "ShippingIndex" }) as number | null

			const ParcelIndex = loadDataFromSessionStorage({ key: "ParcelIndex" }) as number | null
			// const SelectedTab = loadDataFromSessionStorage({ key: "SelectedTab" }) as TabType
			const SelectedTab = sessionStorage.getItem("selectedTab") as TabType

			if ((isNumber(ShippingIndex))) {
				setDeliveryType("address")
			} else if (isNumber(ParcelIndex)) {
				setDeliveryType("machine")
			}

			setSelectedBillingIndex(BillingIndex)
			setSelectedShippingIndex(ShippingIndex)
			setSelectedDeliveryPointIndex(ParcelIndex)
			setSelectedTab(SelectedTab || "parcel_machine")


		}

	}, [visible])
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
			return;
		}

		const makeApiCall = async () => {
			try {
				const response = await middlewareApi({
					endpoint: "checkout/checkIfSubmitEmailPushNotificationWasConfirmed",
					method: 'POST',
					requestBody: {
						"email": simplyInput.trim().toLowerCase(),
						"notificationTokenId": notificationTokenId,
						language: shortLang(i18n.language)
					}
				});
				handleApiResponse(response);
			} catch (error) {
				console.error('Error checking login status:', error);
			}
		};

		const handleApiResponse = ({ ok, rejected, authToken, userData }: any) => {
			if (authToken) {
				handleAuthToken(authToken);
			}

			if (ok) {
				handleSuccessfulResponse(userData);
			} else if (ok === false && rejected === true) {
				handleRejectedResponse();
			} else {
				handleRetry();
			}
		};

		const handleAuthToken = (authToken: string) => {
			setAuthToken(authToken);
			saveDataSessionStorage({ key: 'simplyinToken', data: authToken });
			changeInputValue(simplyinTokenInputField, authToken);
		};

		const handleSuccessfulResponse = (userData: any) => {
			const newData = cleanUserData(userData);
			setUserData(newData);

			if (userData?.language) {
				i18n.changeLanguage(userData.language.toLowerCase());
			}

			saveDataSessionStorage({ key: 'UserData', data: newData });
			setVisible(true);
			setModalStep(2);

			predefinedFill(newData, handleClosePopup, {
				setSelectedBillingIndex,
				setSelectedShippingIndex,
				setSelectedDeliveryPointIndex,
				setSameDeliveryAddress,
				setPickupPointDelivery,
				setSelectedUserData
			});
		};

		const handleRejectedResponse = () => {
			setVisible(true);
			setModalStep("rejected");
		};

		const handleRetry = () => {
			if (counter < maxAttempts) {
				setTimeout(() => setCounter(prev => prev + 1), 1000);
			} else {
				console.log('Login not accepted within 30 seconds');
			}
		};

		const cleanUserData = (data: any) => {
			const { createdAt, updatedAt, ...cleanedData } = data;
			return cleanedData;
		};

		makeApiCall();
	}, [notificationTokenId, counter, visible]);


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

						if (userUsedPushNotifications) {
							setDownloadIconsAllowed(false)
						}
						setPhoneNumber(phoneNumber)
						setVisible(true)

						setLoginType(userUsedPushNotifications ? "app" : "pinCode")

						if (userUsedPushNotifications) {
							setNotificationTokenId(notificationTokenId)
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
			setPickupPointDelivery,
			downloadIconsAllowed,
			selectedTab,
			setSelectedTab,
			deliveryType, setDeliveryType

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
		setPickupPointDelivery,
		downloadIconsAllowed,
		selectedTab,
		setSelectedTab,
		deliveryType, setDeliveryType
	])


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