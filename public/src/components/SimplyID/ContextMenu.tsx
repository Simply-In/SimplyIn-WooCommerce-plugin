import { useState, useContext } from 'react'

import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import styled from 'styled-components';
import { EditIcon } from '../../assets/EditIcon';
import { DeleteIcon } from '../../assets/DeleteIcon';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { Stack } from '@mui/material';
import { CloseIcon } from '../../assets/CloseIcon';
import { CloseContainer, DeleteItemTitle, DeleteItemText } from '../SimplyID/SimplyID.styled';
import { middlewareApi } from '../../services/middlewareApi';
import { ApiContext } from '../SimplyID/SimplyID';
import { saveDataSessionStorage } from '../../services/sessionStorageApi';
import { useTranslation } from 'react-i18next';
import { TabType } from './steps/Step2';

const ContextMenuWrapper = styled.div`
cursor:pointer;
`

const ContextMenuItemContentWrapper = styled.div`
display:flex;
justify-content: flex-start;
align-items: center;
gap: 10px;
width: 100%;
color: #3167B9;
`


const PropertyNameOptions = ["billingAddresses", "shippingAddresses", "parcelLockers"] as const;
type PropertyName = typeof PropertyNameOptions[number];

interface IContextMenu {
	item: number
	setEditItemIndex: (arg: { property: PropertyName, itemIndex: number } | null) => void
	property: PropertyName
	setUserData: any
	userData: any
	selectedPropertyIndex: any
	setSelectedPropertyIndex: any,
	element?: any
	selectedTab?: TabType
}


//context menu of addresse or parcel locker item
export const ContextMenu = ({ userData, element, item, setEditItemIndex, property, setUserData, setSelectedPropertyIndex, selectedTab, selectedPropertyIndex }: IContextMenu) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [openDialog, setOpenDialog] = useState(false);
	const apiToken = useContext(ApiContext)?.authToken;

	const { t } = useTranslation();

	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleEdit = () => {
		setEditItemIndex({ property: property, itemIndex: item })
		handleClose()
	}

	const handleDelete = () => {
		handleOpenDialog();
	};


	const handleOpenDialog = () => {
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
	};



	//deleting selected address
	const handleDeleteConfirmed = () => {
		const selectedRadioItem = findSelectedItem();
		const currentlySelectedItem = findCurrentlySelectedItem();
		const selectedId = element?._id;

		const updatedProperty = removeItemById(userData[property], selectedId);

		const requestData = { userData: { ...userData, [property]: updatedProperty } };
		updateUserData(requestData).then(res => {
			handleApiResponse(res, currentlySelectedItem, selectedRadioItem);
		});

		handleCloseDialog();
		handleClose();
	};

	const findSelectedItem = () => {
		return selectedTab
			? userData?.parcelLockers.filter((el: any) => selectedTab === el.service_type).find((el: any) => el._id === element?._id)
			: userData[property].find((el: any) => el._id === element?._id);
	};

	const findCurrentlySelectedItem = () => {
		return selectedTab
			? userData?.parcelLockers.filter((el: any) => selectedTab === el.service_type)[selectedPropertyIndex]
			: userData[property][selectedPropertyIndex];
	};

	const removeItemById = (items: any, id: any) => {
		return items.filter((el: any) => el._id !== id);
	};

	const updateUserData = async (requestData: any) => {
		try {
			const res = await middlewareApi({
				endpoint: "userData",
				method: 'PATCH',
				token: apiToken,
				requestBody: requestData
			});
			if (res.error) {
				throw new Error(res.error);
			}
			return res;
		} catch (err) {
			console.error('Error updating user data:', err);
			throw err;
		}
	};

	const handleApiResponse = (res: any, currentlySelectedItem: any, selectedRadioItem: any) => {
		if (res.data) {
			const newData = cleanData(res.data);
			setUserData(newData);
			saveDataSessionStorage({ key: 'UserData', data: newData });

			updateSelectedIndex(res.data, currentlySelectedItem, selectedRadioItem);
		}
	};

	const cleanData = (data: any) => {
		const { createdAt, updatedAt, ...cleanedData } = data;
		return cleanedData;
	};

	const updateSelectedIndex = (data: any, currentlySelectedItem: any, selectedRadioItem: any) => {
		if (data[property].length) {
			const customKey = getCustomKey(property);
			if (!customKey) return;

			const filteredData = filterData(data, selectedTab);
			const selectedIndex = getSelectedIndex(filteredData, currentlySelectedItem);

			if (selectedRadioItem && !filteredData.length) {
				setSelectedPropertyIndex(0);
				saveDataSessionStorage({ key: customKey, data: 0 });
			} else {
				setSelectedPropertyIndex(selectedIndex);
				saveDataSessionStorage({ key: customKey, data: selectedIndex });
			}
		} else {
			setSelectedPropertyIndex(null);
		}
	};

	const getCustomKey = (property: any) => {
		switch (property) {
			case "parcelLockers":
				return "ParcelIndex";
			case "billingAddresses":
				return "BillingIndex";
			case "shippingAddresses":
				return "ShippingIndex";
			default:
				return null;
		}
	};

	const filterData = (data: any, selectedTab: any) => {
		return selectedTab
			? data.parcelLockers.filter((el: any) => selectedTab === el.service_type)
			: data[property];
	};

	const getSelectedIndex = (filteredData: any, currentlySelectedItem: any) => {
		return filteredData.findIndex((el: any) => currentlySelectedItem?._id === el?._id);
	};

	//check if address is "deletable"
	const isDeletable = () => {
		if (property !== "billingAddresses") { return true }
		if (userData?.billingAddresses?.length === 1) return false
		return true
	}


	return (
		<div>
			<ContextMenuWrapper onClick={handleClick}>
				<MoreVertIcon />
			</ContextMenuWrapper>

			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'basic-button',
				}}
			>
				{property !== "parcelLockers" && <MenuItem onClick={handleEdit}><ContextMenuItemContentWrapper><EditIcon />{t('modal-step-2.edit')}</ContextMenuItemContentWrapper></MenuItem>}
				{isDeletable() && <MenuItem onClick={handleDelete}><ContextMenuItemContentWrapper><DeleteIcon /> {t('modal-step-2.delete')}</ContextMenuItemContentWrapper></MenuItem>}
			</Menu>
			<Dialog open={openDialog} onClose={handleCloseDialog}>
				<DialogTitle style={{ padding: "12px 24px" }}>
					<Stack direction="row" justifyContent="space-between">

						<DeleteItemTitle >
							{t('modal.addressDelete')}
						</DeleteItemTitle>
						<CloseContainer onClick={handleCloseDialog}>
							<CloseIcon />
						</CloseContainer>
					</Stack>
				</DialogTitle>
				<DialogContent>
					<DeleteItemText>
						{t('modal.addressDeleteConfirmation')}
					</DeleteItemText>
				</DialogContent>
				<DialogActions>
					<Button variant="outlined" color="primary" onClick={handleCloseDialog} fullWidth>{t('modal-form.cancel')}</Button>
					<Button variant="contained" color="error" onClick={handleDeleteConfirmed} fullWidth>{t('modal-step-2.delete')}</Button>
				</DialogActions>
			</Dialog>
		</div>
	)
}

export default ContextMenu