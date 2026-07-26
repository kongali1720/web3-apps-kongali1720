// Web3 Apps - kongali1720
// Configuration - GANTI dengan address setelah deploy!
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ABI = [
  "function get() public view returns (uint256)",
  "function set(uint256 _value) public",
  "function reset() public",
  "function owner() public view returns (address)"
];

// DOM references
const walletSpan = document.getElementById('walletAddress');
const connectBtn = document.getElementById('connectBtn');
const contractAddressSpan = document.getElementById('contractAddress');
const networkSpan = document.getElementById('network');
const isOwnerSpan = document.getElementById('isOwner');
const storedValueDiv = document.getElementById('storedValue');
const inputValue = document.getElementById('inputValue');
const setBtn = document.getElementById('setBtn');
const getBtn = document.getElementById('getBtn');
const resetBtn = document.getElementById('resetBtn');
const activityLog = document.getElementById('activityLog');

// State
let signer = null;
let contract = null;
let currentAccount = null;
let provider = null;

// Helper: log activity
function addActivity(message, icon = 'fa-circle-check') {
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
  activityLog.prepend(entry);
  while (activityLog.children.length > 8) {
    activityLog.removeChild(activityLog.lastChild);
  }
}

// Update stored value
async function updateStoredValue() {
  if (!contract) {
    storedValueDiv.textContent = '⛓️';
    return;
  }
  try {
    const val = await contract.get();
    storedValueDiv.textContent = val.toString();
  } catch (e) {
    storedValueDiv.textContent = '⚠️';
    console.warn('get() error', e);
  }
}

// Update owner status
async function updateOwnerStatus(account) {
  if (!contract || !account) {
    isOwnerSpan.innerHTML = '<i class="fas fa-circle" style="color:#7a7f9f;"></i> unknown';
    return;
  }
  try {
    const owner = await contract.owner();
    const isOwner = owner.toLowerCase() === account.toLowerCase();
    isOwnerSpan.innerHTML = isOwner
      ? '<i class="fas fa-check-circle" style="color:#4cdb7b;"></i> owner'
      : '<i class="fas fa-user" style="color:#aab9f0;"></i> user';
  } catch (e) {
    isOwnerSpan.innerHTML = '<i class="fas fa-exclamation-triangle" style="color:#e68a5f;"></i> error';
  }
}

// Connect wallet
async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    alert('🦊 MetaMask not detected! Please install it.');
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    currentAccount = await signer.getAddress();

    walletSpan.innerHTML = `<i class="fas fa-circle" style="color:#4cdb7b; font-size:0.5rem; margin-right:6px;"></i> ${currentAccount.slice(0,6)}...${currentAccount.slice(-4)}`;
    connectBtn.innerHTML = '<i class="fas fa-link"></i> Connected';

    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    contractAddressSpan.textContent = CONTRACT_ADDRESS.slice(0,8)+'...'+CONTRACT_ADDRESS.slice(-6);

    const network = await provider.getNetwork();
    const chainId = network.chainId;
    let netName = 'Sepolia';
    if (chainId === 1n) netName = 'Ethereum';
    else if (chainId === 11155111n) netName = 'Sepolia';
    else if (chainId === 5n) netName = 'Goerli';
    else if (chainId === 1337n || chainId === 31337n) netName = 'Localhost';
    else netName = `chain ${chainId}`;
    networkSpan.innerHTML = `<i class="fas fa-check-circle" style="color:#3ccf7e; margin-right:4px;"></i> ${netName}`;

    await updateOwnerStatus(currentAccount);
    await updateStoredValue();
    addActivity(`Connected · ${currentAccount.slice(0,6)}...${currentAccount.slice(-4)}`, 'fa-plug');
  } catch (err) {
    console.error(err);
    alert('Connection failed: ' + err.message);
  }
}

// Set value
async function setValue() {
  if (!contract || !signer) {
    alert('Connect wallet first!');
    return;
  }
  const val = parseInt(inputValue.value);
  if (isNaN(val)) {
    alert('Please enter a valid number.');
    return;
  }
  try {
    setBtn.disabled = true;
    setBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> sending';
    const tx = await contract.set(val);
    addActivity(`⏳ Set ${val} · tx ${tx.hash.slice(0,8)}...`, 'fa-hourglass-half');
    await tx.wait();
    addActivity(`✅ Set ${val} confirmed`, 'fa-check-circle');
    await updateStoredValue();
    inputValue.value = '';
  } catch (e) {
    console.error(e);
    addActivity(`❌ Set failed: ${e.message.slice(0,50)}`, 'fa-circle-xmark');
  } finally {
    setBtn.disabled = false;
    setBtn.innerHTML = '<i class="fas fa-pen"></i> Set';
  }
}

// Get value
async function getValue() {
  if (!contract) {
    alert('Connect wallet first.');
    return;
  }
  try {
    await updateStoredValue();
    addActivity('🔄 Fetched value', 'fa-rotate-right');
  } catch (e) {
    addActivity('⚠️ Could not fetch', 'fa-triangle-exclamation');
  }
}

// Reset contract
async function resetContract() {
  if (!contract || !signer) {
    alert('Connect wallet first.');
    return;
  }
  try {
    resetBtn.disabled = true;
    resetBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i>';
    const tx = await contract.reset();
    addActivity(`⏳ Reset · tx ${tx.hash.slice(0,8)}...`, 'fa-hourglass-half');
    await tx.wait();
    addActivity('🔄 Reset confirmed', 'fa-rotate-left');
    await updateStoredValue();
  } catch (e) {
    console.error(e);
    addActivity(`❌ Reset failed: ${e.message.slice(0,50)}`, 'fa-circle-xmark');
  } finally {
    resetBtn.disabled = false;
    resetBtn.innerHTML = '<i class="fas fa-undo-alt"></i> Reset';
  }
}

// Event listeners
connectBtn.addEventListener('click', connectWallet);
setBtn.addEventListener('click', setValue);
getBtn.addEventListener('click', getValue);
resetBtn.addEventListener('click', resetContract);

// Auto connect
window.addEventListener('load', async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        await connectWallet();
      } else {
        contractAddressSpan.textContent = CONTRACT_ADDRESS.slice(0,8)+'...'+CONTRACT_ADDRESS.slice(-6);
      }
    } catch (e) { /* silent */ }
  } else {
    contractAddressSpan.textContent = '🦊 install MetaMask';
  }
});

// Account/chain changes
if (window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      currentAccount = null;
      signer = null;
      contract = null;
      walletSpan.innerHTML = '<i class="fas fa-circle" style="color:#4a7aff; font-size:0.5rem; margin-right:6px;"></i> Not connected';
      connectBtn.innerHTML = '<i class="fas fa-plug"></i> Connect';
      storedValueDiv.textContent = '—';
      isOwnerSpan.innerHTML = '<i class="fas fa-circle" style="color:#7a7f9f;"></i> unknown';
      addActivity('🔌 Wallet disconnected', 'fa-power-off');
    } else {
      connectWallet();
    }
  });

  window.ethereum.on('chainChanged', () => {
    window.location.reload();
  });
}

contractAddressSpan.textContent = CONTRACT_ADDRESS.slice(0,8)+'...'+CONTRACT_ADDRESS.slice(-6);
