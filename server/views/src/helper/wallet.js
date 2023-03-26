const requestAccount = async() => {
    if(window.ethereum) {
        console.log('Metamask founded.')
        try{
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            localStorage.setItem("Owner",accounts[0])
            window.ethereum.on('accountsChanged', function (accounts) {
                console.log(accounts[0])
                localStorage.setItem("Owner",accounts[0])
               });
            //return(accounts[0]);
        }
        catch(err)
        {
            console.error(err);
        }
    }
    else {
        console.log('Metamask not detected.') 
    }
}

const getAxiosObj = (httpMethod,urlPath,form='') => {
    return {
            method: httpMethod,
            url : `http://localhost:5000/fnft/${urlPath}`,
            data: form,
            header: {"content-type": "multipart/form-data"}
           }
}

module.exports =  {
    requestAccount,
    getAxiosObj
}