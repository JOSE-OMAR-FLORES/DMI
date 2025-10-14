<x-mail::message>
# Código de Verificación MFA

@if($userName)
Hola **{{ $userName }}**,
@else
Hola,
@endif

Has solicitado iniciar sesión en tu cuenta. Para completar el proceso de autenticación, utiliza el siguiente código de verificación:

<x-mail::panel>
<div style="text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
{{ $code }}
</div>
</x-mail::panel>

**Este código expirará en {{ $expiresInMinutes }} minutos.**

## Información Importante

- ✅ Si solicitaste este código, ingrésalo en la aplicación para continuar.
- ❌ Si NO solicitaste este código, ignora este mensaje y considera cambiar tu contraseña.
- 🔒 Nunca compartas este código con nadie.

---

**Nota de Seguridad:**  
Este es un correo automático generado para verificar tu identidad. {{ config('app.name') }} nunca te pedirá tu contraseña por correo electrónico.

Gracias,<br>
{{ config('app.name') }}
</x-mail::message>
