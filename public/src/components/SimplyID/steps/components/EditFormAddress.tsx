import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText, Button } from '@mui/material'
import { useContext, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from "react-i18next";
import { ApiContext } from '../../SimplyID';
import { middlewareApi } from '../../../../services/middlewareApi';

interface IEditFormAddress {
	control: any
	isBillingAddress: any
	countryListSelect: any
}



export const EditFormAddress = ({ control, isBillingAddress, countryListSelect }: IEditFormAddress) => {
	const { t } = useTranslation();

	const apiToken = useContext(ApiContext)?.authToken;

	const methods = useFormContext()

	const { watch, setError, getValues, reset, formState: { errors } } = methods


	const nipField = watch('taxId')


	useEffect(() => {
		if (nipField?.length > 8) {
			console.log(nipField);
		}
	}, [nipField])


	const handleTaxIDClick = () => {

		const taxID = getValues("taxId")
		const normalizedTaxId = taxID.replace(/\D/g, '')
		const requestBody = { taxId: normalizedTaxId }
		middlewareApi({
			endpoint: `checkout/retrieveCompanyData` as any,
			method: 'POST',
			token: apiToken,
			requestBody: requestBody
		}).then(({ data }: any) => {


			reset({ ...getValues(), taxID: normalizedTaxId, companyName: data?.companyName, state: data?.state, city: data?.city, street: `${data?.street || ""} ${data?.buildingNumber || ""}`, appartmentNumber: data?.apartmentNumber, postalCode: data?.postalCode })
			if (!data) {
				setError("taxId", { "message": t("modal-form.NoTaxIdData") })
			}
		})
	}


	return (
		<>
			<Grid item xs={12}>
				<Controller
					name="addressName"
					control={control}
					render={({ field }) =>
						<TextField  {...field} label={t('modal-form.addressNamePlaceholder')} fullWidth error={!!errors.addressName} helperText={errors?.addressName?.message as string}
							value={field.value}
							InputLabelProps={{ shrink: true }}
							onChange={(e) => {
								const value = e.target.value;
								field.onChange(value);
							}} />
					}
				/>
			</Grid>
			<Grid item xs={6}>
				<Controller
					name="name"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.name')} fullWidth error={!!errors.name} helperText={errors?.name?.message as string}
							value={field.value}
							InputLabelProps={{ shrink: true }}
							onChange={(e) => {
								const value = e.target.value;
								field.onChange(value);
							}} />
					}
				/>
			</Grid>
			<Grid item xs={6}>
				<Controller
					name="surname"

					control={control}
					render={({ field }) =>

						<TextField {...field} label={t('modal-form.surname')} fullWidth error={!!errors.surname} helperText={errors?.surname?.message as string} value={field.value}
							InputLabelProps={{ shrink: true }}
							onChange={(e) => {
								const value = e.target.value;
								field.onChange(value);
							}} />
					}
				/>
			</Grid>
			<Grid item xs={12}>
				<Controller
					name="companyName"
					control={control}
					render={({ field }) =>
						<TextField {...field}
							label={t('modal-form.companyName')}
							fullWidth
							error={!!errors.companyName}
							helperText={errors?.companyName?.message as string}
							InputLabelProps={{ shrink: true }}
							value={field.value}
							onChange={(e) => {
								const value = e.target.value;
								field.onChange(value);
							}} />


					}
				/>
			</Grid >
			{isBillingAddress && <>
				<Grid item xs={6}>
					<FormControl fullWidth error={!!errors.taxId}>
						<div style={{ display: "flex", alignItems: "center" }}>

							<Controller
								name="taxId"
								control={control}

								defaultValue="" // Make sure to set defaultValue for controlled components
								render={({ field }) => (
									<TextField
										{...field}
										type="text"

										label={t('modal-form.taxId')}
										fullWidth
										error={!!errors.taxId}
										inputProps={{
											inputMode: 'numeric',
										}}
										InputLabelProps={{ shrink: true }}
										onChange={(e) => {
											const value = e.target.value;
											// Only allow numbers, spaces, and dashes
											const filteredValue = value.replace(/[^0-9-\s]/g, '');
											field.onChange(filteredValue); // update field value
										}}
										value={field.value} // controlled value from form
										// helperText={errors?.taxId?.message  as string}
									/>
								)}
							/>





						</div>

						{errors?.taxId && (
							<FormHelperText>{errors.taxId.message as string}</FormHelperText>
						)}
					</FormControl>
				</Grid>

				<Grid item xs={6}>
					<FormControl fullWidth >
						<div style={{ display: "flex", alignItems: "center" }}>



							<Button
								variant="contained" color="primary"
								style={{
									padding: "0px 16px",
									fontFamily: 'Inter, sans-serif',
									border: "1px solid transparent",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									borderRadius: "4px",
									cursor: "pointer",
									color: "#FFFFFF",
									backgroundColor: "rgb(25, 118, 210)",
									textAlign: "center",
								}}
								onClick={handleTaxIDClick}
							>
								{t('modal-form.getTaxIdData')}

							</Button>


						</div>
					</FormControl>
				</Grid>
			</>
			}
			<Grid item xs={12}>
				<Controller
					name="street"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.streetAndNumber')} fullWidth error={!!errors.street} helperText={errors?.street?.message as string} value={field.value}
							onChange={(e) => {
								const value = e.target.value;
								field.onChange(value);
							}}
							InputLabelProps={{ shrink: true }}
						/>
					}
				/>
			</Grid>
			<Grid item xs={12}>
				<Controller
					name="appartmentNumber"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.appartment')} fullWidth error={!!errors.appartmentNumber} helperText={errors?.appartmentNumber?.message as string} value={field.value}
							onChange={(e) => {
								const value = e.target.value;
								field.onChange(value);
							}}
							InputLabelProps={{ shrink: true }}
						/>
					}
				/>
			</Grid>
			<Grid item xs={6}>
				<Controller
					name="postalCode"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.postalCode')} fullWidth error={!!errors.postalCode} helperText={errors?.postalCode?.message as string} value={field.value}
							onChange={(e) => {
								const value = e.target.value;
								field.onChange(value);
							}}
							InputLabelProps={{ shrink: true }}
						/>
					}
				/>
			</Grid>
			<Grid item xs={6}>
				<Controller
					name="city"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.city')} fullWidth error={!!errors.city} helperText={errors?.city?.message as string}
							value={field.value}
							onChange={(e) => {
								const value = e.target.value;
								field.onChange(value);
							}}
							InputLabelProps={{ shrink: true }}
						/>
					}
				/>
			</Grid>
			<Grid item xs={12} style={{ marginBottom: "16px" }}>
				<FormControl fullWidth >
					<Controller
						render={({ field }) =>
							<>
								<InputLabel id="country-label">{t('modal-form.country')}</InputLabel>
								<Select labelId="country-label" {...field} label={t('modal-form.country')}  >

									{countryListSelect?.map((item: any) => (
										<MenuItem key={item.code} value={item.code}>
											{t(`countries.${item.code}`)}
										</MenuItem>
									))}
								</Select >
								<FormHelperText>{errors?.country?.message as string}</FormHelperText>
							</>
						}

						name="country"
						control={control}
					/>
				</FormControl>
			</Grid>

		</>
	)
}
