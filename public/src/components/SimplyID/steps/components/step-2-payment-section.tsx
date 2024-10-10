
import { CardActions, CardContent, Collapse, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DataPropertiesNames, ExpandMore, RadioPropertiesNamesType, expandedType } from '../Step2';
import { DataValueContainer, DataValueLabel, DataValueTitle, NoDataLabel, RadioElementContainer, SectionTitle } from '../../SimplyID.styled';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useContext } from 'react';
import { SelectedDataContext } from '../../SimplyID';
import ContextMenu from '../../ContextMenu';




type Step2Props = {
	expanded: expandedType
	handleAddNewData: (property: DataPropertiesNames) => void
	handleExpandClick: (property: keyof expandedType, value?: boolean) => void
	handleChange: (event: React.ChangeEvent<HTMLInputElement>, type: RadioPropertiesNamesType) => void
	setUserData: any
	userData: any
	setEditItemIndex: any
}
export const Step2PaymentSection = ({ expanded, handleAddNewData, handleExpandClick, handleChange, setUserData, userData, setEditItemIndex }: Step2Props) => {

	const { t } = useTranslation();
	const { selectedPaymentIndex, setSelectedPaymentIndex } = useContext(SelectedDataContext)


	console.log(userData?.paymentDetails);
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
							<>
								<DataValueTitle>
									{userData?.paymentDetails[selectedPaymentIndex]?.cardName ?? <>{t('modal-step-2.paymentMethod')}{" "}{+selectedPaymentIndex + 1}</>}
								</DataValueTitle>
								{userData?.shippingAddresses &&
									<DataValueLabel>
										{"**** **** **** "}{userData?.paymentDetails[selectedPaymentIndex]?.cardNumberLastDigits || "****"}
										{", " + userData?.paymentDetails[selectedPaymentIndex]?.cardProvider || ""}
									</DataValueLabel>
								}
							</> :
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
												<DataValueContainer>
													<DataValueTitle>
														{el?.cardName ?? <>{t('modal-step-2.paymentMethod')}{" "}{+index + 1}</>}
													</DataValueTitle>
													<DataValueLabel>
														{"**** **** **** "}{el?.cardNumberLastDigits || "****"}
														{", " + el?.cardProvider || ""}
													</DataValueLabel>
												</DataValueContainer>
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
