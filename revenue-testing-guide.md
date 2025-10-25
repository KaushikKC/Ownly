# 💰 Revenue Testing Guide - Step by Step

## Understanding the Revenue Flow

### The Players:
- **Original IP**: Your first registered IP asset
- **Derivative IP**: Child IP based on the original
- **External User**: Someone who tips your content

## Test Scenario: Complete Revenue Flow

### Step 1: Create Parent IP
1. Register IP: "My Original Song"
2. Get License Terms ID: `12345` (from registration response)
3. Note the IP ID: `0xABC...`

### Step 2: Create Derivative IP
1. Go to Original IP → Derivative tab
2. Create derivative: "Remix of My Original Song"
3. Use same License Terms ID: `12345`
4. Note the new IP ID: `0xDEF...`

### Step 3: Test Revenue Flows

#### Flow A: External Tip to Original IP
```
External User → Original IP (0xABC...)
```
- Go to Original IP → Revenue tab → Actions
- Receiver IP ID: `0xABC...` (your original IP)
- Payer IP ID: (leave empty - external tip)
- Amount: 2.0 WIP
- Click "Pay Royalty"

**Result**: Original IP earns 2.0 WIP

#### Flow B: Derivative Pays Parent (Manual Test)
```
Derivative IP (0xDEF...) → Original IP (0xABC...)
```
- Go to Derivative IP → Revenue tab → Actions
- Receiver IP ID: `0xABC...` (parent IP)
- Payer IP ID: `0xDEF...` (derivative IP)
- Amount: 1.0 WIP
- Click "Pay Royalty"

**Result**: Parent IP earns 1.0 WIP from derivative

#### Flow C: Cross-IP Payment
```
Original IP (0xABC...) → Derivative IP (0xDEF...)
```
- Go to Original IP → Revenue tab → Actions
- Receiver IP ID: `0xDEF...` (derivative IP)
- Payer IP ID: `0xABC...` (original IP)
- Amount: 0.5 WIP
- Click "Pay Royalty"

**Result**: Derivative IP earns 0.5 WIP from original

### Step 4: Claim Revenue
1. Go to Original IP → Revenue tab → Actions
2. Amount: 1.5 WIP (claim some of your earnings)
3. Click "Claim Revenue"

## Revenue Tracking

### What You'll See:
- **Total Earned**: Sum of all payments received
- **Claimable**: Amount you can withdraw
- **Payment History**: List of all incoming payments
- **Claim History**: List of all withdrawals

### Revenue Sources:
1. **External Tips**: Direct payments from users
2. **Derivative Royalties**: Automatic share from derivative earnings
3. **Cross-IP Payments**: Manual payments between your IPs
4. **License Sales**: Revenue from selling license tokens

## Key Concepts

### License Terms ID:
- **Generated during IP registration**
- **Found in registration response**
- **Same for parent and all its derivatives**
- **Used to mint license tokens**

### IP Relationships:
- **Parent IP**: Original content
- **Derivative IP**: Based on parent content
- **Revenue flows UP**: Child → Parent
- **License terms flow DOWN**: Parent → Child

### Revenue Flow:
- **External → IP**: Direct tips/payments
- **IP → IP**: Cross-promotion payments
- **Derivative → Parent**: Automatic royalty sharing
- **License Token Sales**: Revenue from licensing

## Testing Checklist

### ✅ Registration Phase:
- [ ] Register original IP
- [ ] Note License Terms ID
- [ ] Note IP ID
- [ ] Verify on Story Protocol explorer

### ✅ Derivative Phase:
- [ ] Create derivative IP
- [ ] Use same License Terms ID
- [ ] Note derivative IP ID
- [ ] Verify parent-child relationship

### ✅ Revenue Phase:
- [ ] External tip to original IP
- [ ] Derivative pays parent
- [ ] Cross-IP payment
- [ ] Claim revenue from original IP
- [ ] Verify revenue tracking

### ✅ License Phase:
- [ ] Mint license tokens from original IP
- [ ] Use License Terms ID
- [ ] Verify tokens in dashboard
- [ ] Test license token functionality

## Common Questions

### Q: Where do I find License Terms ID?
**A**: It's returned when you register your IP asset. Check the registration response or your database.

### Q: Does creating a derivative create a new IP?
**A**: Yes! It creates a completely new IP asset that's linked to the parent.

### Q: Who pays who in revenue flow?
**A**: 
- External users pay IP owners (tips)
- Derivative IPs automatically share revenue with parent
- You can manually send payments between your IPs

### Q: How does automatic royalty sharing work?
**A**: When a derivative earns money, the parent gets a percentage based on license terms (e.g., 10% goes to parent).

### Q: Can I test without real money?
**A**: Yes! Use testnet WIP tokens for all testing. No real money required.
