//MetaMask Initializer
var selectedAccount;
const web3 = new Web3(window.ethereum);
challengeContract = new web3.eth.Contract(challengeABI, '0xacC0Dc8B8c25DcA9B03f46Af350f3f3403343cFc');

function connectMetamask() {
  Swal.fire({
    title: `Error`,
    html: '<p style="font-family:georgia,garamond,serif;color:black;">Please connect your wallet to the interface</p>',
    icon: 'error'
  });
}

function startApp() {
  let provider = window.ethereum;
  if (typeof provider !== 'undefined') {
    // Metamask is not installed
    provider
      .request({ method: 'eth_requestAccounts' })
      .then((accounts) => {
        if (selectedAccount == accounts[0]) {
          Swal.fire({
            title: 'Metamask',
            html: '<p style="font-family:georgia,garamond,serif;color:black;">You are already logged in</p>', icon: 'info'
          });
        } else {
          selectedAccount = accounts[0];
          console.log(`Selected account is ${selectedAccount}`);
          Swal.fire({
            title: 'Metamask',
            html: '<p style="font-family:georgia,garamond,serif;color:black;">You logged in sucessfully</p>', icon: 'success'
          });
          document.querySelector('#walletAddress').innerHTML = `${accounts[0]}`;   
        }
      })
      .catch((err) => {
        console.log(err);
        return;
      });
      
      window.ethereum.on('accountsChanged', function (accounts) {
        selectedAccount = accounts[0];
        Swal.fire({
          title: 'Metamask',
          html: '<p style="font-family:georgia,garamond,serif;color:black;">You have changed the wallet</p>', icon: 'info'
        });
        document.querySelector('#walletAddress').innerHTML = `${accounts[0]}`;
        console.log(`Selected account changed to ${selectedAccount}`);
      });
  }
};

document.querySelector('#connectButton').addEventListener('click', () => {
  startApp();
});

document.querySelector('#requestTotalCash').addEventListener('click', () => {
  if (selectedAccount) {
    totalCash().then(tx => {
      Swal.fire({
        title: 'My Cash',
        html: `<p style="font-family:georgia,garamond,serif;color:black;">Total cash of ${selectedAccount} = ${tx} Pesos`,
        icon: 'info'});
    }).catch(err => console.log(err));

  } else {
    connectMetamask();
  }
});

document.querySelector('#mintCashButton').addEventListener('click', () => {
  if (selectedAccount) {
    let value = document.querySelector('#mintCashInput').value;
    if (value == '') {
      Swal.fire({
        title: 'Error',
        html: `<p style="font-family:georgia,garamond,serif;color:black;">Please fill mintCash input</p>`,
        icon: 'error'
      });
    } else {
      mintCash(value).then(tx => {
        Swal.fire({
          title: 'Success !',
          html: `<p style="font-family:georgia,garamond,serif;color:black;">You bought ${value} Pesos successfully, check your balance</p>`,
          icon: 'success'
        });
        console.log(tx);
      }).catch(err => console.log(err));
    }
  } else {
connectMetamask()
  }
});

document.querySelector('#convertDenomButton').addEventListener('click', () => {
  if (selectedAccount) {
    let _value = document.querySelector('#convertDenomInput').value;
    if (_value == '') {
      Swal.fire({
        title: 'Error',
        html: `<p style="font-family:georgia,garamond,serif;color:black;">Please fill convertDenom input</p>`,
        icon: 'error'
      });
    } else {
      convertDenom(_value).then(tx => {
        Swal.fire({
          title: 'Convert Denom',
          html: `<p style="font-family:georgia,garamond,serif;color:black;">${tx}</p>`,
          icon: 'info'
        })
      }).catch(err => console.log(err));
    }
  } else {
connectMetamask()
  }

});

document.querySelector('#submitBanknotes').addEventListener('click', () => {
  if (selectedAccount) {
    let banknotesArray = [];
    for (let i = 0; i < 6; i++) {
      let banknoteValue = document.querySelector(`#index${i}`).value;
      if (banknoteValue == '') {
        Swal.fire({
          title: 'Error',
          html: `<p style="font-family:georgia,garamond,serif;color:black;">Invalid parameter at individual banknotes input</p>`,
          icon: 'error'
        });
        return;
      } else {
        banknotesArray[i] = banknoteValue;
      }
    }
    changeStocks(banknotesArray).then(tx => {
      console.log(tx);
      Swal.fire({
        title: 'Success !',
        html: `<p style="font-family:georgia,garamond,serif;color:black;">New stock set successfully, check stock with CheckStock button</p>`,
        icon: 'success'
      });
    }).catch(err => console.log(err));
  } else {
connectMetamask()
  }
});

document.querySelector('#checkStockButton').addEventListener('click', async () => {
  if (selectedAccount) {
    let cashSupplyArray = [];
    for (let i = 0; i < 6; i++) {
      await cashSupply(i).then(tx => {
        cashSupplyArray[i] = tx;
      })
    }
    Swal.fire({
      title: 'Actual cash supply',
      html: `<p style="font-family:georgia,garamond,serif;color:black;">1 Peso notes = ${cashSupplyArray[0]}<br>
      5 Peso notes = ${cashSupplyArray[1]}<br>
      10 Peso notes = ${cashSupplyArray[2]}<br>
      20 Peso notes = ${cashSupplyArray[3]}<br>
      50 Peso notes = ${cashSupplyArray[4]}<br>
      100 Peso notes = ${cashSupplyArray[5]}<br></p>`,
      icon: 'success'
    });
  } else {
connectMetamask()
  }
});

window.addEventListener('load', () => {
  Swal.fire('Welcome to my challenge ! Please make sure your MetaMask is connected to Kovan public testnet.');
});

// Contract functions

function totalCash() {
  return challengeContract.methods.totalCashOfUser().call({ from: selectedAccount });
}

function convertDenom(_value) {
  return challengeContract.methods.convertDenom(_value).call({ from: selectedAccount });
}

function changeStocks(arrayOfValues) {
  return challengeContract.methods.changeStocks(arrayOfValues).send({ from: selectedAccount });
}

function mintCash(value) {
  return challengeContract.methods.mintCash(value).send({ from: selectedAccount });
}

function cashSupply(i) {
  return challengeContract.methods.CashSupply(i).call({ from: selectedAccount });
}