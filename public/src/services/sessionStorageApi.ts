interface ISessionStorageData {
	key: 'UserData' | "simplyinToken" | "phoneToken" | "phoneInput" | "electronicContactApprove" | "marketingContactApprove" | "useParcel" | "isInpostKeyValid" | "nipField"
	data: any
}

type ILocalStorageDataKeyType = 'EasyPackPointObject'
interface ILocalStorageDataByKeyName {
	'EasyPackPointObject': {
		pointName: string, pointDesc: string, pointAddDesc: string
	};

}

interface ILocalStorageData {
	key: ILocalStorageDataKeyType
	data: ILocalStorageDataByKeyName[ILocalStorageDataKeyType]
}




export const saveDataSessionStorage = ({ key, data }: ISessionStorageData) => {
	try {
		sessionStorage.setItem(key, JSON.stringify(data));
	} catch (error) {
		console.error("Error saving data", error);
	}
}


export const removeDataSessionStorage = ({ key }: loadFunctionArgsType) => {
	try {
		sessionStorage.removeItem(key);
	} catch (error) {
		console.error("Error removing data", error);
	}
}


type loadFunctionArgsType = Pick<ISessionStorageData, 'key'>

export const loadDataFromSessionStorage = ({ key }: loadFunctionArgsType) => {
	try {
		const serializedData = sessionStorage.getItem(key);
		if (serializedData === null) {
			return undefined;
		}
		return JSON.parse(serializedData);
	} catch (error) {
		console.error("Error loading data", error);
		return undefined;
	}
}


export const saveDataLocalStorage = ({ key, data }: ILocalStorageData) => {
	try {
		localStorage.setItem(key, JSON.stringify(data));
	} catch (error) {
		console.error("Error saving data", error);
	}
}