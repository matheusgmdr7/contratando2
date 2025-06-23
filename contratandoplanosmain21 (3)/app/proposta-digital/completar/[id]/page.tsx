import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { checkSubscription } from "@/lib/subscription"
import { PropostaForm } from "./_components/proposta-form"

interface Props {
  params: {
    id: string
  }
}

const PropostaPage = async ({ params }: Props) => {
  const { id } = params

  if (!id) {
    redirect("/proposta-digital")
  }

  const isPro = await checkSubscription()

  const proposta = await db.proposta.findUnique({
    where: {
      id,
    },
  })

  if (!proposta) {
    redirect("/proposta-digital")
  }

  async function onFinish(data: any) {
    try {
      await db.proposta.update({
        where: {
          id: proposta.id,
        },
        data: {
          ...data,
          status: "ASSINADO",
        },
      })

      // Após salvar a assinatura com sucesso
      try {
        // Se for proposta de corretor, notificar o corretor
        if (proposta.origem === "propostas_corretores" && proposta.corretor_email) {
          const { enviarEmailPropostaAssinada } = await import("@/services/email-service")

          await enviarEmailPropostaAssinada(
            proposta.corretor_email,
            proposta.corretor_nome || "Corretor",
            proposta.nome_cliente || proposta.nome,
            proposta.id,
            proposta.valor_total || proposta.valor || 0,
          )
          console.log("✅ Corretor notificado sobre assinatura")
        }
      } catch (emailError) {
        console.warn("⚠️ Erro ao notificar corretor:", emailError)
        // Não falhar o processo por causa do email
      }

      redirect("/proposta-digital")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="container">
      <PropostaForm isPro={isPro} initialData={proposta} onFinish={onFinish} />
    </div>
  )
}

export default PropostaPage
