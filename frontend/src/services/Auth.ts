// const API_URL = "https://twoguysburgerapi.azurewebsites.net";

export const isAdmin = async (): Promise<{ isAdmin: boolean }> => {
    // const response = await fetch(`${API_URL}/auth/is-admin`, {
    //     method: "GET",
    //     headers: {
    //         "Content-Type": "application/json"
    //     }
    // });

    // const data = await response.json();

    return {
        isAdmin: true // data.is_admin
    };
};
