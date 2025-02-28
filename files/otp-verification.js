const htmlContent = `
    <html>
    <head>
        <meta http-equiv="Content-Type" content="test/html; charset=UTF-8" />
    </head>
    <body style="font-size: 16px;">
        <p style="text-align: center; font-size: 13px;"> DO <strong>NOT</strong> SEND OR SHARE THIS CODE WITH ANYONE! </p>
        <p style="line-height: 20px;">
            Please <strong>copy</strong> the OTP below and paste it in the email verification page on the web app. 
        </p>
        <p style="font-weight: bolder; font-size: 35px; text-align: center; letter-spacing: 10px"> <strong>{{otp}} </strong> </p>
    </body>
    </html>
`

module.exports = htmlContent