## Error: `User is locked. Reason: Exhausted balance`

### Qué significa
- El sistema que genera los videos usa la cuenta Falcon AI (fal.ai) para ejecutar los renders.  
- Cuando la cuenta principal se queda sin saldo, Falcon bloquea cualquier petición nueva y responde con:  
  `{"detail":"User is locked. Reason: Exhausted balance. Top up your balance at fal.ai/dashboard/billing."}`
- Eso no es un bug del frontend: la petición llega correctamente, pero el proveedor rechaza la generación hasta que se recargue el balance.

### Cómo resolverlo
1. Inicia sesión en https://fal.ai/dashboard/billing con las credenciales del proyecto.  
2. Compra o recarga créditos suficientes (puede ser “Kling credits”, “Render tokens” u otro pack habilitado en tu cuenta).  
3. Vuelve a la consola, presiona “Mejorar con IA” o “Generar video” y el servicio ya debería responder con contenido válido.

### Qué hacer en el producto
- Muestra este mensaje dentro de la UI cuando el backend regresa el texto de Falcon. Puedes detectar el fragmento `"Exhausted balance"` y remarcar:  
  > “Tu saldo de renderizado se agotó. Recarga en https://fal.ai/dashboard/billing para continuar.”
- Añade el enlace como un CTA en el modal de error para evitar que el usuario tenga que pedir soporte adicional.

### Prevención
- Si avisas a finanzas del cliente, considera dejar un recordatorio en la documentación de operaciones para revisar el balance antes de cada demo.  
- También puedes registrar la respuesta de Falcon y alertar automáticamente cuando falten menos de X créditos.
