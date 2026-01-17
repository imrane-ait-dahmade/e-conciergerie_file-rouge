/**
 * HTML email templates for authentication flows.
 */

export function buildVerificationEmailHtml(prenom: string, verificationLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérifiez votre email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 24px;">
    <tr>
      <td style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
        <h1 style="margin: 0 0 24px; font-size: 24px; color: #18181b;">Bienvenue, ${escapeHtml(prenom)} !</h1>
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Merci de vous être inscrit. Veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse email.
        </p>
        <p style="margin: 0 0 32px;">
          <a href="${escapeHtml(verificationLink)}" 
             style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Vérifier mon email
          </a>
        </p>
        <p style="margin: 0; font-size: 14px; color: #71717a;">
          Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
        </p>
        <p style="margin: 24px 0 0; font-size: 12px; color: #a1a1aa;">
          Si le bouton ne fonctionne pas, copiez ce lien :<br>
          <a href="${escapeHtml(verificationLink)}" style="color: #2563eb; word-break: break-all;">${escapeHtml(verificationLink)}</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

export function buildResetPasswordEmailHtml(prenom: string, resetLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation du mot de passe</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 24px;">
    <tr>
      <td style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
        <h1 style="margin: 0 0 24px; font-size: 24px; color: #18181b;">Réinitialisation du mot de passe</h1>
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Bonjour ${escapeHtml(prenom)},
        </p>
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
        </p>
        <p style="margin: 0 0 32px;">
          <a href="${escapeHtml(resetLink)}" 
             style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p style="margin: 0; font-size: 14px; color: #71717a;">
          Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
        </p>
        <p style="margin: 24px 0 0; font-size: 12px; color: #a1a1aa;">
          Si le bouton ne fonctionne pas, copiez ce lien :<br>
          <a href="${escapeHtml(resetLink)}" style="color: #2563eb; word-break: break-all;">${escapeHtml(resetLink)}</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
