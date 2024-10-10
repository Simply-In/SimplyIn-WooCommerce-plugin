
import { CardActions, CardContent, Collapse, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ExpandMore, RadioPropertiesNamesType, expandedType } from '../Step2';
import { DataValueContainer, DataValueLabel, DataValueTitle, NoDataLabel, RadioElementContainer, SectionTitle } from '../../SimplyID.styled';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useContext, useEffect } from 'react';
import { SelectedDataContext } from '../../SimplyID';
import ContextMenu from '../../ContextMenu';

import { MasterCardIcon } from '../../../../assets/mastercardIcon.tsx';
import { VisaIcon } from '../../../../assets/visaIcon.tsx'


type Step2Props = {
	expanded: expandedType
	handleExpandClick: (property: keyof expandedType, value?: boolean) => void
	handleChange: (event: React.ChangeEvent<HTMLInputElement>, type: RadioPropertiesNamesType) => void
	setUserData: any
	userData: any
	setEditItemIndex: any
}
export const Step2PaymentSection = ({ expanded, handleExpandClick, handleChange, setUserData,
	userData,
	setEditItemIndex }: Step2Props) => {

	const { t } = useTranslation();
	const { selectedPaymentIndex, setSelectedPaymentIndex } = useContext(SelectedDataContext)

	useEffect(() => {
		if (userData?.paymentDetails?.length) {
			setSelectedPaymentIndex(0)
		}
	}, [])

	return (
		<>
			<CardActions disableSpacing sx={{ padding: 0 }}>
				<SectionTitle>{t('modal-step-2.paymentMethod')}</SectionTitle>
				<ExpandMore
					expand={expanded.shipping}
					onClick={() => handleExpandClick("paymentDetails")}
					aria-expanded={expanded.shipping}
					aria-label="show more"
				>
					<ExpandMoreIcon />
				</ExpandMore>
			</CardActions>

			<Collapse in={!expanded.paymentDetails} timeout="auto" unmountOnExit >
				{userData?.paymentDetails?.length
					?
					<DataValueContainer style={{ padding: 8 }}>

						{(selectedPaymentIndex !== null && !isNaN(selectedPaymentIndex)) ?
							<div style={{ display: "flex", flexDirection: "row" }}>
								<div className="logo"
									style={{
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										minWidth: "50px",
										width: "50px",
										marginRight: "8px",
									}}>
									{userData?.paymentDetails[selectedPaymentIndex]?.cardProvider === "visa" ?
										<VisaIcon /> :
										<MasterCardIcon />}

								</div>
								<div>
								<DataValueTitle>
									{userData?.paymentDetails[selectedPaymentIndex]?.cardName ?? <>{t('modal-step-2.paymentMethod')}{" "}{+selectedPaymentIndex + 1}</>}
								</DataValueTitle>
									{userData?.paymentDetails &&
									<DataValueLabel>
											{"**** **** **** "}{userData?.paymentDetails[selectedPaymentIndex]?.cardNumberLastDigits || "****"}
									</DataValueLabel>
								}
								</div>
							</div> :
							<NoDataLabel>{t('modal-step-2.paymentMethodNotSelected')}</NoDataLabel>
						}
					</DataValueContainer>
					: null


				}

			</Collapse>
			<Collapse in={expanded.paymentDetails} timeout="auto" unmountOnExit sx={{ padding: '0px !important' }}>
				<CardContent sx={{ padding: '8px', paddingBottom: '0px !important' }}>
					<RadioGroup
						value={selectedPaymentIndex}
						aria-labelledby="demo-radio-buttons-group-label"
						name="radio-buttons-group"
					>
						{userData?.paymentDetails?.length
							?
							userData?.paymentDetails.map((el: any, index: number) => {
								return (
									<RadioElementContainer key={el._id}>
										<FormControlLabel value={index} control={<Radio onClick={(e) => handleChange(e as any, "paymentDetails")} />}
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
														{el?.cardProvider === "visa" ?
															<VisaIcon /> :
															<MasterCardIcon />}

													</div>
													<DataValueContainer>
														<DataValueTitle>
															{el?.cardName ?? <>{t('modal-step-2.paymentMethod')}{" "}{+index + 1}</>}
														</DataValueTitle>
														<DataValueLabel>
															{"**** **** **** "}{el?.cardNumberLastDigits || "****"}
														</DataValueLabel>
													</DataValueContainer>
												</div>
											} style={{ marginBottom: 0 }} />
										<ContextMenu
											setUserData={setUserData}
											item={index}
											setEditItemIndex={setEditItemIndex}
											property={"paymentDetails"}
											userData={userData}
											selectedPropertyIndex={selectedPaymentIndex}
											setSelectedPropertyIndex={setSelectedPaymentIndex}
											element={el} />
									</RadioElementContainer>)

							})
							:

							<NoDataLabel>{t('modal-step-2.noData')}</NoDataLabel>
						}
					</RadioGroup>
				</CardContent>

			</Collapse >

		</>
	)
}
