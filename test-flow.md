# 🧪 Story Protocol Testing Flow

## Prerequisites
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:3000`
- Wallet connected to Aeneid testnet
- Some test WIP tokens (for fees)

## Test Scenarios

### Scenario 1: Basic IP Registration & Licensing
1. **Register IP Asset**
   - Go to "Add New IP" or "YouTube Link"
   - Paste: `https://www.youtube.com/watch?v=dQw4w9WgXcQ` (or any video you own)
   - Title: "Test Music Video"
   - Description: "Testing Story Protocol integration"
   - License: Commercial Remix, 10% royalty
   - Click "Register with Story Protocol"

2. **Verify Registration**
   - Check dashboard for your IP
   - Should show "Registered on Story Protocol" status
   - Note the Story Protocol Asset ID

3. **Mint License Tokens**
   - Open IP card → License tab
   - License Terms ID: (from registration response)
   - Amount: 3
   - Max Minting Fee: 0.1
   - Click "Mint License Tokens"
   - Verify tokens appear in "Minted License Tokens" section

### Scenario 2: Derivative Registration
1. **Create Derivative**
   - Same IP card → Derivative tab
   - Click "Register Derivative"
   - Title: "Test Derivative"
   - Description: "Based on original test video"
   - Source URL: Same or different YouTube video
   - Owner: Your wallet address
   - License Terms ID: Same as parent
   - Submit

2. **Verify Derivative**
   - Check dashboard for new derivative IP
   - Should show parent-child relationship
   - Should have its own Story Protocol Asset ID

### Scenario 3: Revenue Sharing
1. **Pay Royalty (External Tip)**
   - Original IP card → Revenue tab → Actions
   - Receiver IP ID: Your original IP's Story Protocol ID
   - Payer IP ID: (leave empty for external tip)
   - Amount: 2.0
   - Token: WIP
   - Click "Pay Royalty"

2. **Pay Royalty (IP to IP)**
   - From derivative IP → Revenue tab → Actions
   - Receiver IP ID: Original IP's Story Protocol ID
   - Payer IP ID: Derivative IP's Story Protocol ID
   - Amount: 1.0
   - Click "Pay Royalty"

3. **Claim Revenue**
   - Original IP → Revenue tab → Actions
   - Amount: 1.5
   - Click "Claim Revenue"

### Scenario 4: Cross-Platform Testing
1. **Create Second IP**
   - Register another YouTube video
   - Different title/description
   - Same license terms

2. **Cross-IP Royalty Payment**
   - From second IP → Pay royalty to first IP
   - Verify revenue tracking shows cross-IP payments

## Expected Results

### ✅ Success Indicators
- [ ] IP assets register successfully with Story Protocol
- [ ] License tokens mint without errors
- [ ] Derivatives link to parent IPs
- [ ] Royalty payments process successfully
- [ ] Revenue tracking shows correct amounts
- [ ] Revenue claims work
- [ ] Transaction hashes are valid
- [ ] Explorer links work

### 🔍 What to Check
1. **Console Logs**: No errors in browser console
2. **Transaction Hashes**: Valid blockchain transaction IDs
3. **Explorer Links**: Links to Aeneid explorer work
4. **Database Updates**: Backend shows new records
5. **UI Updates**: Cards refresh with new data

### 🚨 Common Issues & Solutions

#### Issue: "Asset must be registered with Story Protocol first"
**Solution**: Make sure you complete the initial IP registration before trying to mint licenses

#### Issue: "Failed to mint license tokens"
**Solution**: Check that you have enough WIP tokens for minting fees

#### Issue: "License terms not found"
**Solution**: Use the correct License Terms ID from the initial registration

#### Issue: "Transaction failed"
**Solution**: Check wallet connection and ensure you have enough tokens

## Test Data Examples

### Sample YouTube URLs for Testing
- `https://www.youtube.com/watch?v=dQw4w9WgXcQ` (Rick Roll - public domain)
- `https://www.youtube.com/watch?v=9bZkp7q19f0` (PSY - Gangnam Style)
- Any video you own or have rights to

### Sample License Terms
- **Commercial Remix**: 10% royalty, 0.1 WIP minting fee
- **Non-Commercial**: 5% royalty, 0.05 WIP minting fee
- **Exclusive**: 20% royalty, 0.2 WIP minting fee

### Sample Wallet Addresses (Testnet)
- `0x1234567890123456789012345678901234567890`
- `0xabcdefabcdefabcdefabcdefabcdefabcdefabcd`

## Debugging Tips

1. **Check Browser Console** for JavaScript errors
2. **Check Network Tab** for failed API calls
3. **Check Backend Logs** for server errors
4. **Verify Wallet Connection** to Aeneid testnet
5. **Check Token Balance** for WIP tokens

## Success Metrics

- ✅ 3+ IP assets registered
- ✅ 2+ license tokens minted
- ✅ 1+ derivative created
- ✅ 3+ royalty payments made
- ✅ 1+ revenue claim successful
- ✅ All UI components working
- ✅ No console errors
- ✅ All transactions confirmed on blockchain
