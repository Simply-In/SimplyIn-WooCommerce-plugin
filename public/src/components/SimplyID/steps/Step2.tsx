import { useContext, useEffect, useMemo, useState } from 'react'
import { PopupHeader, Step2Title, SectionTitle, RadioElementContainer, DataValueContainer, DataValueLabel, DataValueTitle, AddNewData, AddNewDataText, NoDataLabel, DeliveryPointContainer, RadioElementContainerMachine } from '../SimplyID.styled'
import { IconButton, CardContent, CardActions, Collapse, Button, FormControl, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { IconButtonProps } from '@mui/material/IconButton';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { Step2Form } from './components/Step2Form';

import { styled } from '@mui/material/styles';
import { PlusIcon } from '../../../assets/PlusIcon';
import ContextMenu from '../ContextMenu';
import { SelectedDataContext } from '../SimplyID';
import { resetDeliveryMethod, selectPickupPointInpost } from '../../../functions/selectInpostPoint';

import { useTranslation } from "react-i18next";
import { getPlaceholder } from './functions';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { DeliveryType, isNumber } from '../../../hooks/useSelectedSimplyData';
import { loadDataFromSessionStorage } from '../../../services/sessionStorageApi';
import { Step2PaymentSection } from './components/step-2-payment-section';
import { Step2PaymentForm } from './components/Step2FormPaymentEdit';

interface IStep2 {
	handleClosePopup: () => void;
	userData: any
	setUserData: any,
	setSelectedUserData: any,
	editItemIndex: any,
	setEditItemIndex: any,
}

export type expandedType = {
	billing: boolean,
	shipping: boolean,
	deliveryPoint: boolean,
	paymentDetails: boolean
}

interface ExpandMoreProps extends IconButtonProps {
	expand: boolean;
}

export const ExpandMore = styled((props: ExpandMoreProps) => {
	const { ...other } = props;
	return <IconButton {...other} />;
})(({ theme, expand }) => ({
	transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
	marginLeft: 'auto',
	transition: theme.transitions.create('transform', {
		duration: theme.transitions.duration.shortest,
	}),
}));



export type TabType = "parcel_machine" | "service_point"



export type RadioPropertiesNamesType = "billing" | "shipping" | "parcelLockers" | "paymentDetails"

export type DataPropertiesNames = "billingAddresses" | "shippingAddresses" | "parcelLockers" | "paymentDetails"

export const Step2 = ({ handleClosePopup, userData, setUserData, setSelectedUserData, editItemIndex, setEditItemIndex }: IStep2) => {
	const { t } = useTranslation();

	const [expanded, setExpanded] = useState({
		billing: true,
		shipping: false,
		deliveryPoint: true,
		paymentDetails: false
	});

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
		setDeliveryType,
		selectedPaymentIndex,
		setSelectedPaymentIndex

	} = useContext(SelectedDataContext)



	const handleChangeTab = (_: React.SyntheticEvent, newValue: TabType) => {
		setSelectedTab(newValue);
		setSelectedDeliveryPointIndex(selectedShippingIndex || 0)
	};

	const handleExpandClick = (property: keyof expandedType, value?: boolean) => {

		setExpanded((prev) => {
			return ({ ...prev, [property]: value ?? !prev[property] })
		});
	};

	//handling of selected address change
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>, type: RadioPropertiesNamesType) => {
		if (type === "billing") {
			setSelectedBillingIndex(+(event.target as HTMLInputElement).value);
		}
		else if (type === "shipping") {
			setSelectedShippingIndex(+(event.target as HTMLInputElement).value);
			setSameDeliveryAddress(false)
			setPickupPointDelivery(false)
		}
		else if (type === "parcelLockers") {
			setSelectedDeliveryPointIndex(+(event.target as HTMLInputElement).value);
			setPickupPointDelivery(true)
		}
		else if (type === "paymentDetails") {

			setSelectedPaymentIndex((prev: number | null) => {



				return prev === +(event.target as HTMLInputElement).value ? null : +(event.target as HTMLInputElement).value
			})
		}

	}

	const handleAddNewData = (property: DataPropertiesNames) => {
		setEditItemIndex({ property: property, itemIndex: userData[property]?.length ? userData[property]?.length : 0, isNewData: true })
	}

	const filteredParcelLockers = useMemo(() => userData?.parcelLockers.filter((el: any) => selectedTab === "parcel_machine" ? el.service_type === "parcel_machine" : el.service_type !== "parcel_machine"), [selectedTab, userData?.parcelLockers])

	const handleSelectData = () => {
		if (!userData?.billingAddresses[selectedBillingIndex]) {
			return
		}
		if (deliveryType === "address") {
			resetDeliveryMethod()
			setSelectedUserData((prev: any) => {
				sessionStorage.setItem("BillingIndex", `${selectedBillingIndex}`)
				sessionStorage.setItem("ShippingIndex", `${selectedShippingIndex}`)
				sessionStorage.setItem("ParcelIndex", `null`)
				sessionStorage.setItem("SelectedTab", `${selectedTab}`)
				sessionStorage.setItem("paymentDetails", `${selectedPaymentIndex}`)


				return ({
					...prev,
					billingAddresses: userData?.billingAddresses[selectedBillingIndex || 0],
					shippingAddresses: (selectedShippingIndex !== null && userData?.shippingAddresses?.length) ? userData?.shippingAddresses[selectedShippingIndex || 0] : null,
					parcelLockers: null,
					paymentDetails: selectedPaymentIndex

				})
			})
		} else {
			setSelectedUserData((prev: any) => {
				sessionStorage.setItem("BillingIndex", `${selectedBillingIndex}`)
				sessionStorage.setItem("ShippingIndex", `null`)
				sessionStorage.setItem("ParcelIndex", `${selectedDeliveryPointIndex}`)
				sessionStorage.setItem("SelectedTab", `${selectedTab}`)
				sessionStorage.setItem("paymentDetails", `${selectedPaymentIndex}`)

				return ({
					...prev,
					billingAddresses: userData?.billingAddresses[selectedBillingIndex || 0],
					shippingAddresses: null,
					parcelLockers: filteredParcelLockers[selectedDeliveryPointIndex]?.lockerId || null,
					paymentDetails: selectedPaymentIndex
				})
			})
			if (selectedDeliveryPointIndex !== undefined) {

				const filteredParcelLockers = userData?.parcelLockers.filter((el: any) => selectedTab === "parcel_machine" ? el.service_type === "parcel_machine" : el.service_type !== "parcel_machine")
				const parcelId = filteredParcelLockers[selectedDeliveryPointIndex]?.lockerId

				selectPickupPointInpost({ deliveryPointID: parcelId });
			}
		}
		handleClosePopup()
	}

	// function for expanding and collapsing sections in modal
	const handleChangeShippingCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSameDeliveryAddress(() => {
			handleExpandClick("shipping", !event.target.checked)
			if (event.target.checked) {
				setSelectedShippingIndex(null)
				handleExpandClick("shipping", false)
			} else {
				setSelectedShippingIndex(0)
			}
			return (event.target.checked)
		});
	};

	// function for handling delivery type change - shipping or pickup point
	const handleChangeDelivery = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDeliveryType((event.target as HTMLInputElement).value as DeliveryType);
		if ((event.target as HTMLInputElement).value === "machine") {
			if (filteredParcelLockers?.length) {
				setPickupPointDelivery(true)
				if (!isNumber(selectedDeliveryPointIndex) || selectedDeliveryPointIndex > filteredParcelLockers?.length) {
					setSelectedDeliveryPointIndex(0)
				}


			}
		} else {
			if (!isNumber(selectedShippingIndex)) {
				setSameDeliveryAddress(true)
			}
		}
	};

	useEffect(() => {

		//event on 1st render step 2 (after login)


		const BillingIndex = (loadDataFromSessionStorage({ key: "BillingIndex" }) || 0) as number
		const ShippingIndex = loadDataFromSessionStorage({ key: "ShippingIndex" }) as number | null

		const ParcelIndex = loadDataFromSessionStorage({ key: "ParcelIndex" }) as number | null
		// const SelectedTab = loadDataFromSessionStorage({ key: "SelectedTab" }) as TabType
		const SelectedTab = sessionStorage.getItem("SelectedTab")

		if ((isNumber(ShippingIndex))) {
			setDeliveryType("address")
		} else if (isNumber(ParcelIndex)) {
			setDeliveryType("machine")
		}

		setSelectedBillingIndex(BillingIndex)
		setSelectedShippingIndex(ShippingIndex)
		setSelectedDeliveryPointIndex(ParcelIndex)
		setSelectedTab(SelectedTab || "parcel_machine")

	}, [])


	useEffect(() => {
		console.log("editItemIndex", editItemIndex);

	}, [editItemIndex])




	return (
		<>
			{!editItemIndex?.property &&
				<PopupHeader style={{ position: "relative", zIndex: 1, padding: 0, borderBottom: "none" }}>
					<Step2Title >
						{t('modal-step-2.selectData')}
					</Step2Title>
				</PopupHeader>
			}



			{!editItemIndex?.property && <>
				<CardActions disableSpacing sx={{ padding: 0 }}>
					<SectionTitle>{t('modal-step-2.billingData')}</SectionTitle>
					<ExpandMore
						expand={expanded.billing}
						onClick={() => handleExpandClick('billing')}
						aria-expanded={expanded.billing}
						aria-label="show more"
					>
						<ExpandMoreIcon />
					</ExpandMore>
				</CardActions>

				<Collapse in={!expanded.billing} timeout="auto" unmountOnExit>
					{userData?.billingAddresses?.length
						?
						<DataValueContainer style={{ padding: 8 }}>
							<DataValueTitle>{userData?.billingAddresses[selectedBillingIndex || 0]?.icon ? <>{userData?.billingAddresses[selectedBillingIndex || 0]?.icon}{" "}</> : <></>}{userData?.billingAddresses[selectedBillingIndex || 0]?.addressName ?? <>{t('modal-step-2.address')}{" "}{(+selectedBillingIndex || 0) + 1}</>}</DataValueTitle>
							{userData?.billingAddresses &&
								<DataValueLabel>
									{userData?.billingAddresses[selectedBillingIndex || 0]?.street || ""}
									{userData?.billingAddresses[selectedBillingIndex || 0]?.appartmentNumber.length ? "/" + userData?.billingAddresses[selectedBillingIndex || 0]?.appartmentNumber : ""}
									{", " + userData?.billingAddresses[selectedBillingIndex || 0]?.city || ""}
								</DataValueLabel>
							}
						</DataValueContainer>
						:
						<CardContent>
							<NoDataLabel>{t('modal-step-2.noData')}</NoDataLabel>
						</CardContent>
					}
				</Collapse>
				<Collapse in={expanded.billing} timeout="auto" unmountOnExit>
					<CardContent sx={{ padding: '8px', paddingBottom: '0px !important' }}>
						<RadioGroup
							value={selectedBillingIndex}
							aria-labelledby="demo-radio-buttons-group-label"
							name="radio-buttons-group"
							onChange={(e) => handleChange(e, "billing")}
						>
							{userData?.billingAddresses?.length
								?
								userData?.billingAddresses.map((el: any, index: number) => {
									return (
										<RadioElementContainer key={el._id}>
											<FormControlLabel value={index} control={<Radio />}
												label={
													<DataValueContainer>
														<DataValueTitle>{el?.icon ? <>{el?.icon}{" "}</> : <></>}{el?.addressName ? el.addressName : <>{t('modal-step-2.address')}{" "}{index + 1}</>}</DataValueTitle>
														<DataValueLabel>{el?.street || ""}
															{el?.appartmentNumber.length ? "/" + el?.appartmentNumber : ""}
															{", " + el?.city || ""}</DataValueLabel>
													</DataValueContainer>
												} style={{ marginBottom: 0 }} />
											<ContextMenu userData={userData} setUserData={setUserData} item={index} setEditItemIndex={setEditItemIndex} property={'billingAddresses'}
												selectedPropertyIndex={selectedBillingIndex}
												setSelectedPropertyIndex={setSelectedBillingIndex}
												element={el}

											/>
										</RadioElementContainer>)

								})
								:

								<NoDataLabel>{t('modal-step-2.noData')}</NoDataLabel>
							}
						</RadioGroup>


					</CardContent>

				</Collapse>
				<AddNewData onClick={() => handleAddNewData("billingAddresses")} style={{ paddingBottom: 12, borderBottom: " 1px solid #D9D9D9" }}>
					<PlusIcon />
					<AddNewDataText>{t('modal-step-2.addNewBillingData')}</AddNewDataText>
				</AddNewData>


				{/* <HorizontalLine /> */}
				<FormControl style={{ fontFamily: "font-family: Inter, sans-serif;", borderBottom: " 1px solid #D9D9D9", marginBottom: 12, width: "100%" }}>
					<SectionTitle>{t('modal-step-2.delivery')}</SectionTitle>
					<RadioGroup
						aria-labelledby="radioDeliveryType"
						name="radioDeliveryType"
						value={deliveryType}
						onChange={handleChangeDelivery}
						style={{ padding: "8px 8px 0 8px" }}
					>
						<FormControlLabel value="address" control={<Radio />} label={<Typography style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold', fontSize: "16px" }}>{t('modal-step-2.doorDelivery')}</Typography>} />
						<FormControlLabel value="machine" control={<Radio />} label={<Typography style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold', fontSize: "16px" }}>{t('modal-step-2.parcelDelivery')}</Typography>} />

					</RadioGroup>
				</FormControl>

				{deliveryType === "address" && <>
					<CardActions disableSpacing sx={{ padding: 0 }}>
						<SectionTitle>{t('modal-step-2.shippingData')}</SectionTitle>
						<ExpandMore
							expand={expanded.shipping}
							onClick={() => handleExpandClick("shipping")}
							aria-expanded={expanded.shipping}
							aria-label="show more"
						>
							<ExpandMoreIcon />
						</ExpandMore>
					</CardActions>
					<FormGroup>
						<FormControlLabel sx={{
							textAlign: 'left',
							fontFamily: 'Inter, sans-serif',
							'& .MuiTypography-root': {
								fontFamily: 'Inter, sans-serif'
							}
						}} style={{ textAlign: 'left', fontFamily: "Inter, sans-serif" }} control={<Checkbox checked={sameDeliveryAddress} onChange={handleChangeShippingCheckbox} />} label={t('modal-step-2.sameData')} />

					</FormGroup>
					<Collapse in={!expanded.shipping} timeout="auto" unmountOnExit >
						{userData?.shippingAddresses?.length
							?
							<DataValueContainer style={{ padding: 8 }}>

								{!sameDeliveryAddress && (selectedShippingIndex !== null && !isNaN(selectedShippingIndex)) &&
									<>
										<DataValueTitle>
										{userData?.billingAddresses[selectedShippingIndex]?.icon ? <>{userData?.billingAddresses[selectedShippingIndex]?.icon}{" "}</> : <></>}
										{userData?.shippingAddresses[selectedShippingIndex]?.addressName ?? <>{t('modal-step-2.address')} {+selectedShippingIndex + 1}</>}
										</DataValueTitle>
										{userData?.shippingAddresses &&
											<DataValueLabel>
											{userData?.shippingAddresses[selectedShippingIndex]?.street || ""}
											{userData?.shippingAddresses[selectedShippingIndex]?.appartmentNumber.length ? "/" + userData?.shippingAddresses[selectedShippingIndex]?.appartmentNumber : ""}
											{", " + userData?.shippingAddresses[selectedShippingIndex]?.city || ""}
											</DataValueLabel>
										}
									</>

								}
							</DataValueContainer>
							: null


						}

					</Collapse>
					<Collapse in={expanded.shipping} timeout="auto" unmountOnExit sx={{ padding: '0px !important' }}>
						<CardContent sx={{ padding: '8px', paddingBottom: '0px !important' }}>
							<RadioGroup
								value={selectedShippingIndex}
								aria-labelledby="demo-radio-buttons-group-label"
								name="radio-buttons-group"
								onChange={(e) => handleChange(e, "shipping")}

							>
								{userData?.shippingAddresses?.length
									?
									userData?.shippingAddresses.map((el: any, index: number) => {
										return (
											<RadioElementContainer key={el._id}>
												<FormControlLabel value={index} control={<Radio />}
													label={
														<DataValueContainer>
															<DataValueTitle>
																{el?.icon ? <>{el?.icon}{" "}</> : <></>}
																{el?.addressName ? el?.addressName : <>{t('modal-step-2.address')}{" "}{index + 1}</>}</DataValueTitle>
															<DataValueLabel>
																{el?.street || ""}
																{el?.appartmentNumber.length ? "/" + el?.appartmentNumber : ""}
																{", " + el?.city || ""}
															</DataValueLabel>
														</DataValueContainer>
													} style={{ marginBottom: 0 }} />
												<ContextMenu setUserData={setUserData} item={index} setEditItemIndex={setEditItemIndex} property={"shippingAddresses"} userData={userData}
													selectedPropertyIndex={selectedShippingIndex}
													setSelectedPropertyIndex={setSelectedShippingIndex}
													element={el} />
											</RadioElementContainer>)

									})
									:

									<NoDataLabel>{t('modal-step-2.noData')}</NoDataLabel>
								}
							</RadioGroup>
						</CardContent>

					</Collapse>
					<AddNewData onClick={() => handleAddNewData("shippingAddresses")} style={{
						paddingBottom: 12, borderBottom: "1px solid #D9D9D9"
					}} >
						<PlusIcon />
						<AddNewDataText>{t('modal-step-2.addNewShippingData')}</AddNewDataText>
					</AddNewData>
				</>}



				{deliveryType === "machine" &&
					<>
						<CardActions disableSpacing sx={{ padding: 0 }}>
						<SectionTitle>{t('modal-step-2.PudoAndParcelMachines')}</SectionTitle>
						<ExpandMore
							expand={expanded.deliveryPoint}
							onClick={() => handleExpandClick("deliveryPoint")}
							aria-expanded={expanded.deliveryPoint}
							aria-label="show more"
						>
							<ExpandMoreIcon />
						</ExpandMore>
					</CardActions>
					<Collapse in={!expanded.deliveryPoint} timeout="auto" unmountOnExit>
						{filteredParcelLockers.length
							?
							<DataValueContainer style={{ padding: 8 }}>

								{pickupPointDelivery && (selectedDeliveryPointIndex !== null && !isNaN(selectedDeliveryPointIndex)) ?
									<>
										<DataValueTitle>
											{filteredParcelLockers[selectedDeliveryPointIndex]?.addressName ||
												filteredParcelLockers[selectedDeliveryPointIndex]?.lockerId ||
												t('modal-step-2.address') + +selectedDeliveryPointIndex + 1}
										</DataValueTitle>
										{userData?.parcelLockers &&
											<DataValueLabel>
												{filteredParcelLockers[selectedDeliveryPointIndex]?.address || ""}
											</DataValueLabel>
										}
									</>
									:
									<div style={{ padding: "8px" }}>
										<NoDataLabel>{t('modal-step-2.notSelectedDeliveryPoint')}</NoDataLabel>
									</div>

								}
							</DataValueContainer>
							:

							<CardContent>
								<NoDataLabel>{t('modal-step-2.noData')}</NoDataLabel>
							</CardContent>

						}

					</Collapse>
					<Collapse in={expanded.deliveryPoint} timeout="auto" unmountOnExit>
						<CardContent sx={{ padding: '8px 0px 0px 0px !important' }}>
							<RadioGroup
								value={selectedDeliveryPointIndex}
								aria-labelledby="demo-radio-buttons-group-label"
								name="radio-buttons-group"
								onChange={(e) => {
									handleChange(e, "parcelLockers")
								}}
							>
								<TabContext value={selectedTab}>
									<Box sx={{ borderColor: 'divider' }}>
										<TabList onChange={handleChangeTab} >
											<Tab label={t('modal-step-2.parcelMachines')} value="parcel_machine" style={{ padding: "0px", fontSize: "16px", fontWeight: "700", fontFamily: "Inter, sans-serif", textTransform: "none" }} />
											<Tab label={t('modal-step-2.pudo')} value="service_point" style={{ marginLeft: "12px", padding: "0px", fontSize: "16px", fontWeight: "700", fontFamily: "Inter, sans-serif", textTransform: "none" }} />
										</TabList>
									</Box>
									<TabPanel value="parcel_machine" style={{ padding: "24px 4px" }}>
										{filteredParcelLockers.length
											?
											filteredParcelLockers.map((el: any, index: number) => {
												return (
													<RadioElementContainerMachine key={el?.id ?? index} >
														<FormControlLabel value={index} control={<Radio />}
															label={
																<div style={{ display: "flex" }}>
																	<div className="logo"
																		style={{
																			display: "flex",
																			justifyContent: "center",
																			alignItems: "center",
																			minWidth: "50px",
																			width: "50px",
																			marginRight: "8px"
																		}}>
																		<img src={el?.logoUrl || getPlaceholder()} alt={el.label || "supplier logo"} style={{
																			width: '42px',
																			height: '42px'
																		}} />
																	</div>
																		<DeliveryPointContainer>
																			<DataValueContainer>
																				<DataValueTitle>{el?.addressName || el?.lockerId || <>{t('modal-step-2.point')}{" "}{index + 1}</>}</DataValueTitle>
																				<DataValueLabel>{el?.address ?? ""}</DataValueLabel>
																			</DataValueContainer>
																			<div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignContent: "center", transform: "scale(1.4)" }}>
																				{el?.icon || ""}
																			</div>
																		</DeliveryPointContainer>
																</div>
															} style={{ marginBottom: 0 }} />
														<ContextMenu
															setUserData={setUserData}
															item={index}
															element={el}
															setEditItemIndex={setEditItemIndex}
															property={"parcelLockers"}
															userData={userData}
															selectedPropertyIndex={selectedDeliveryPointIndex}
															setSelectedPropertyIndex={setSelectedDeliveryPointIndex}
															selectedTab={selectedTab} />
													</RadioElementContainerMachine>)

											})
											:

											<NoDataLabel>{t('modal-step-2.noData')}</NoDataLabel>
										}
									</TabPanel>
									<TabPanel value="service_point" style={{ padding: "24px 4px" }}>
										{filteredParcelLockers.length
											?
											filteredParcelLockers.map((el: any, index: number) => {
												return (
													<RadioElementContainerMachine key={el?.id ?? index} >
														<FormControlLabel value={index} control={<Radio />}
															label={
																<div style={{ display: "flex" }}>
																	<div className="logo"
																		style={{
																			display: "flex",
																			justifyContent: "center",
																			alignItems: "center",
																			minWidth: "50px",
																			width: "50px",
																			marginRight: "8px"
																		}}>
																		<img src={el?.logoUrl || getPlaceholder()} alt={el.label || "supplier logo"} style={{
																			width: '42px',
																			height: '42px'
																		}} />
																	</div>
																		<DeliveryPointContainer >
																			<DataValueContainer>
																				<DataValueTitle>{el?.addressName || el?.lockerId || <>{t('modal-step-2.point')}{" "}{index + 1}</>}</DataValueTitle>
																				<DataValueLabel>{el?.address ?? ""}</DataValueLabel>
																			</DataValueContainer>
																			<div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignContent: "center", transform: "scale(1.4)" }}>
																				{el?.icon || ""}
																			</div>
																		</DeliveryPointContainer>
																</div>
															} style={{ marginBottom: 0 }} />
														<ContextMenu
															setUserData={setUserData}
															element={el}
															item={index}
															setEditItemIndex={setEditItemIndex}
															property={"parcelLockers"}
															userData={userData}
															selectedPropertyIndex={selectedDeliveryPointIndex}
															setSelectedPropertyIndex={setSelectedDeliveryPointIndex}
															selectedTab={selectedTab} />
													</RadioElementContainerMachine>)

											})
											:

											<NoDataLabel>{t('modal-step-2.noData')}</NoDataLabel>
										}

									</TabPanel>

								</TabContext>
							</RadioGroup>
						</CardContent>

					</Collapse>
					<AddNewData onClick={() => handleAddNewData("parcelLockers")}>
						<PlusIcon />
						<AddNewDataText>{t('modal-step-2.addNewParcelData')}</AddNewDataText>
					</AddNewData>
				</>

				}

				<Step2PaymentSection expanded={expanded} handleAddNewData={handleAddNewData} handleExpandClick={handleExpandClick} handleChange={handleChange}
					setUserData={setUserData} userData={userData} setEditItemIndex={setEditItemIndex}
				/>


				<div style={{
					position: "sticky",
					margin: "0 -16px",
					padding: "16px 16px 8px",
					background: "white",
					bottom: "0px",
					zIndex: "10",
					borderTop: "1px solid #F1F7FF"
				}}>
					<Button type="button" variant="contained" color="primary" fullWidth onClick={handleSelectData}
						sx={{
							fontFamily: 'Inter, sans-serif'
						}}>
						{t('modal-step-2.selectData')}
					</Button>
				</div>
			</>}
			{editItemIndex?.property && editItemIndex?.property !== "paymentDetails" &&
				<Step2Form
					userData={userData}
					isNewData={editItemIndex?.isNewData}
					setUserData={setUserData}
					editItem={{ ...(editItemIndex), editData: (userData[editItemIndex?.property])[editItemIndex?.itemIndex] }}
					setEditItemIndex={setEditItemIndex}
					setSelectedBillingIndex={setSelectedBillingIndex}
					setSelectedShippingIndex={setSelectedShippingIndex}
					setSelectedDeliveryPointIndex={setSelectedDeliveryPointIndex}
					setSameDeliveryAddress={setSameDeliveryAddress}
				selectedTab={selectedTab}
				setSelectedTab={setSelectedTab}

				/>}

			{editItemIndex?.property == "paymentDetails" &&
				<Step2PaymentForm
					userData={userData}
					isNewData={editItemIndex?.isNewData}
					setUserData={setUserData}
					editItem={{ ...(editItemIndex), editData: (userData[editItemIndex?.property])[editItemIndex?.itemIndex] }}
					selectedPaymentIndex={selectedPaymentIndex}
					setSelectedPaymentIndex={setSelectedPaymentIndex}
					setEditItemIndex={setEditItemIndex}

				/>
			}
		</>
	)
}

export default Step2