import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2),
  email: z.email(),
  phone: z.string().trim().optional(),
  message: z.string().trim().min(10),
});

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body JSON invalido." },
      { status: 400 },
    );
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Datos de contacto invalidos.",
        fields: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Formulario validado. Conecta aqui tu CRM, email o automatizacion.",
    lead: parsed.data,
  });
}
