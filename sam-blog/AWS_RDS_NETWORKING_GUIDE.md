# AWS RDS Networking & Connectivity Guide

Connecting a local development machine to an AWS RDS instance is notoriously difficult for beginners because AWS enforces a strict, multi-layered security and networking model. This document outlines the exact mistakes we encountered and the first-principles steps to resolve them.

> [!NOTE]
> This guide specifically covers exposing an RDS database to the public internet for local development. For production environments, it is best practice to keep databases private and connect via EC2 jump boxes, AWS Client VPN, or VPC Peering.

---

## The 3 Layers of AWS Networking

For a packet to travel from your laptop to your AWS database, it must successfully pass through three distinct layers:
1. **The Instance Layer:** The database must be configured to accept public connections and have a public IP address.
2. **The Firewall Layer:** The Security Group must explicitly whitelist your incoming traffic.
3. **The Subnet Layer:** The physical subnet the database sits in must have a route to the internet.

If **any** of these layers are misconfigured, your connection will silently drop or timeout.

---

## ❌ Mistake 1: The "Private IP" Trap

By default, AWS creates databases on an isolated internal network. Even if your security group is open, the database physically has no public IP address.

**The Symptom:**
Running `Test-NetConnection` returns an IP address starting with `172.31.x.x` or `10.x.x.x`.

**The Solution:**
1. Go to the **RDS Dashboard** -> Select your database -> Click **Modify**.
2. Scroll to **Connectivity** -> **Additional configuration**.
3. Change **Public access** from *Not publicly accessible* to **Publicly accessible**.
4. Save and apply immediately.
5. **Flush your DNS:** Your laptop will remember the old private IP. Run `ipconfig /flushdns` in PowerShell to force your computer to fetch the newly assigned public IP address.

---

## ❌ Mistake 2: The Firewall (Security Group) Trap

By default, AWS Security Groups block 100% of incoming traffic. 

**The Symptom:**
DNS resolves to a public IP (e.g., `32.x.x.x`), but `Test-NetConnection` still fails with `TcpTestSucceeded : False`.

**The Solution:**
1. Go to the **Security Group** attached to your database.
2. Under **Inbound rules**, click **Edit inbound rules**.
3. Add a rule for **PostgreSQL** (Port 5432).
4. Set the Source to **My IP** (or `0.0.0.0/0` if your IP frequently changes).

> [!WARNING]
> **Common AWS UI Error:** `You may not specify an IPv4 CIDR for an existing referenced group id rule.`
> If you try to edit an existing rule that was originally pointing to a Security Group ID (e.g., `sg-0abc...`) and change it to an IP address (`0.0.0.0/0`), AWS will crash the page. You **must** delete the broken row and click **Add rule** to create a fresh one.

---

## ❌ Mistake 3: The Private Subnet / Route Table Trap

This is the most dangerous gotcha in AWS. You can set the database to "Publicly Accessible" (giving it a public IP), and you can open the firewall, but if the database sits in a "Private Subnet", the connection will still fail. A subnet is only "Public" if its Route Table has a wire pointing to an Internet Gateway.

**The Symptom:**
The DB is public, the firewall is open (`0.0.0.0/0`), but the connection *still* times out.

**The Solution:**
1. In RDS, click on your database and look at the **Subnets** list under the Connectivity tab.
2. Notice the names! If AWS named them `RDS-Pvt-subnet...`, they are isolated.
3. Click on the Subnet, then click on its **Route table ID**.
4. Under the **Routes** tab, click **Edit routes**.
5. Click **Add route**:
   * **Destination:** `0.0.0.0/0`
   * **Target:** Internet Gateway (`igw-...`)

> [!CAUTION]
> **Don't look at the "Main" Route Table!** A VPC usually has a Main Route Table (which has an Internet Gateway), but RDS automatically creates explicit *Private Route Tables* for your databases. Always click the exact Route Table associated with the specific subnet your database is sitting in.

---

## ❌ Mistake 4: The Region & Gateway Confusion

When trying to fix Route Tables, it is easy to get lost in the AWS VPC Dashboard.

> [!TIP]
> **"You do not have any VPCs" Error:**
> If you try to attach an Internet Gateway and AWS says you have no VPCs, it usually means you are in the wrong AWS Region (e.g., Ohio instead of N. Virginia). Look at the top right corner of the AWS console to fix this.
>
> If you *are* in the correct region and it still says this, it means your VPC **already has an Internet Gateway attached**. AWS strictly limits you to 1 Gateway per VPC, so it hides your VPC from the dropdown to prevent you from attaching a second one. Skip the creation step and go straight to your Route Tables!
