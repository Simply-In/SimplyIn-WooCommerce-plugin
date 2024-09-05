import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material'
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from "react-i18next";

interface IEditFormAddress {
	control: any
	errors: any
	isBillingAddress: any
	countryListSelect: any
}



export const EditFormAddress = ({ control, errors, isBillingAddress, countryListSelect }: IEditFormAddress) => {
	const { t } = useTranslation();


	const methods = useFormContext()

	const { watch, setError } = methods


	const nipField = watch('taxId')


	useEffect(() => {
		if (nipField?.length > 8) {
			console.log(nipField);
		}
	}, [nipField])


	const handleTaxIDClick = () => {
		setError("taxId", { "message": t("modal-form.NoTaxIdData") })
	}



	return (
		<>
			<Grid item xs={12}>
				<Controller
					name="addressName"
					control={control}
					render={({ field }) =>
						<TextField  {...field} label={t('modal-form.addressNamePlaceholder')} fullWidth error={!!errors.addressName} helperText={errors?.addressName?.message} />
					}
				/>
			</Grid>
			<Grid item xs={6}>
				<Controller
					name="name"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.name')} fullWidth error={!!errors.name} helperText={errors?.name?.message} />
					}
				/>
			</Grid>
			<Grid item xs={6}>
				<Controller
					name="surname"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.surname')} fullWidth error={!!errors.surname} helperText={errors?.surname?.message} />
					}
				/>
			</Grid>
			<Grid item xs={12}>
				<Controller
					name="companyName"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.companyName')} fullWidth error={!!errors.companyName} helperText={errors?.companyName?.message} />
					}
				/>
			</Grid >
			{isBillingAddress &&
				<Grid item xs={12}>
					<FormControl fullWidth error={!!errors.taxId}>
						<div style={{ display: "flex", alignItems: "center" }}>
							<TextField
								// {...field}
								label={t('modal-form.taxId')}
								fullWidth
								error={!!errors.taxId}
							/>

							<div
								style={{
									padding: "0px 16px",
									marginLeft: "8px",
									border: "1px solid rgb(0, 0, 0, 0.23)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									borderRadius: "4px",
									cursor: "pointer",
									color: "#FFFFFF",
									backgroundColor: "rgb(25, 118, 210)",
									textAlign: "center"

								}}
								onClick={handleTaxIDClick}
							>
								{t('modal-form.getTaxIdData')}
							</div>
						</div>
						{errors?.taxId && (
							<FormHelperText>{errors.taxId.message}</FormHelperText>
						)}
					</FormControl>
				</Grid>
			}
			<Grid item xs={12}>
				<Controller
					name="street"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.streetAndNumber')} fullWidth error={!!errors.street} helperText={errors?.street?.message} />
					}
				/>
			</Grid>
			<Grid item xs={12}>
				<Controller
					name="appartmentNumber"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.appartment')} fullWidth error={!!errors.appartmentNumber} helperText={errors?.appartmentNumber?.message} />
					}
				/>
			</Grid>
			<Grid item xs={6}>
				<Controller
					name="postalCode"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.postalCode')} fullWidth error={!!errors.postalCode} helperText={errors?.postalCode?.message} />
					}
				/>
			</Grid>
			<Grid item xs={6}>
				<Controller
					name="city"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.city')} fullWidth error={!!errors.city} helperText={errors?.city?.message} />
					}
				/>
			</Grid>
			<Grid item xs={12} style={{ marginBottom: "16px" }}>
				<FormControl fullWidth error={errors.country}>
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
								<FormHelperText>{errors?.country?.message}</FormHelperText>
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
