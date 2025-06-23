import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface EmailRequest {
  to: string
  subject: string
  nome: string
  corretor?: string
  link?: string
  tipo?: string
  cliente?: string
  proposta?: string
  valor?: number
  comissao?: number
  motivo?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    console.log("📧 Iniciando envio de email...")

    const requestData: EmailRequest = await req.json()
    console.log("📝 Dados recebidos:", {
      to: requestData.to,
      subject: requestData.subject,
      tipo: requestData.tipo || "proposta_cliente",
    })

    const { to, subject, nome, corretor, link, tipo, cliente, proposta, valor, comissao, motivo } = requestData

    // Validar dados obrigatórios
    if (!to || !nome) {
      console.error("❌ Dados obrigatórios faltando:", { to: !!to, nome: !!nome })
      return new Response(
        JSON.stringify({
          error: "Dados obrigatórios: to, nome",
          received: { to: !!to, nome: !!nome },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    // Obter variáveis de ambiente
    const resendApiKey = Deno.env.get("RESEND_API_KEY")
    const fromEmail = Deno.env.get("FROM_EMAIL") || "noreply@contratandoplanos.com.br"

    console.log("🔑 Verificando configurações:", {
      hasResendKey: !!resendApiKey,
      fromEmail: fromEmail,
    })

    if (!resendApiKey) {
      console.error("❌ RESEND_API_KEY não configurada")
      return new Response(
        JSON.stringify({
          error: "RESEND_API_KEY não configurada nas variáveis de ambiente",
          help: "Configure RESEND_API_KEY no painel do Supabase",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    // Gerar conteúdo do email baseado no tipo
    let htmlContent = ""
    let emailSubject = subject

    switch (tipo) {
      case "proposta_completada":
        // Email para corretor - cliente completou proposta
        emailSubject = emailSubject || `Proposta completada - ${cliente}`
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <title>Proposta Completada</title>
              <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: #168979; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                  .highlight { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #168979; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h1>✅ Proposta Completada!</h1>
                  </div>
                  <div class="content">
                      <p>Olá <strong>${nome}</strong>,</p>
                      
                      <div class="highlight">
                          <h3>🎉 Boa notícia!</h3>
                          <p>O cliente <strong>${cliente}</strong> completou a proposta <strong>${proposta}</strong>.</p>
                      </div>
                      
                      <p><strong>Próximos passos:</strong></p>
                      <ul>
                          <li>Acesse seu painel de corretor</li>
                          <li>Verifique os documentos enviados</li>
                          <li>Processe a proposta</li>
                      </ul>
                      
                      <p>Acesse seu painel para dar continuidade ao processo.</p>
                  </div>
              </div>
          </body>
          </html>
        `
        break

      case "proposta_assinada":
        // Email para corretor - cliente assinou proposta
        emailSubject = emailSubject || `🎉 Cliente ${cliente} assinou a proposta!`
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <title>Proposta Assinada</title>
              <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #168979 0%, #13786a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                  .success-box { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 5px; margin: 20px 0; }
                  .value-box { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h1>🎉 Proposta Assinada!</h1>
                  </div>
                  <div class="content">
                      <p>Olá <strong>${nome}</strong>,</p>
                      
                      <div class="success-box">
                          <h3>✅ Excelente notícia!</h3>
                          <p>O cliente <strong>${cliente}</strong> assinou a proposta <strong>${proposta}</strong>!</p>
                      </div>
                      
                      ${
                        valor
                          ? `
                      <div class="value-box">
                          <h4>💰 Valor da Proposta</h4>
                          <h2>R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h2>
                      </div>
                      `
                          : ""
                      }
                      
                      <p><strong>Próximos passos:</strong></p>
                      <ul>
                          <li>A proposta será enviada para análise</li>
                          <li>Você receberá uma notificação quando for aprovada</li>
                          <li>Acompanhe o status no seu painel</li>
                      </ul>
                      
                      <p>Parabéns pela venda! 🎊</p>
                  </div>
              </div>
          </body>
          </html>
        `
        break

      case "proposta_aprovada":
        // Email para corretor - proposta aprovada
        emailSubject = emailSubject || `✅ Proposta aprovada - ${cliente}`
        htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Proposta Aprovada</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .approved-box { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 20px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 PROPOSTA APROVADA!</h1>
            </div>
            <div class="content">
                <p>Olá <strong>${nome}</strong>,</p>
                
                <div class="approved-box">
                    <h3>✅ Parabéns!</h3>
                    <p>A proposta do cliente <strong>${cliente}</strong> foi <strong>APROVADA</strong>!</p>
                    <p><strong>Proposta:</strong> ${proposta}</p>
                </div>
                
                ${
                  valor
                    ? `
                <div style="text-align: center; margin: 20px 0;">
                    <h4>💰 Valor da Proposta</h4>
                    <h2 style="color: #28a745;">R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h2>
                </div>
                `
                    : ""
                }
                
                <p><strong>O que acontece agora:</strong></p>
                <ul>
                    <li>O cliente será notificado sobre a aprovação</li>
                    <li>O contrato será gerado automaticamente</li>
                    <li>O processo de ativação do plano será iniciado</li>
                </ul>
                
                <p>Parabéns pelo excelente trabalho! Continue assim! 🚀</p>
            </div>
        </div>
    </body>
    </html>
  `
        break

      case "proposta_rejeitada":
        // Email para corretor - proposta não aceita
        emailSubject = emailSubject || `❌ Proposta não aceita - ${cliente}`
        htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Proposta Não Aceita</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .rejected-box { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .support-box { background: #e3f2fd; border: 1px solid #bbdefb; color: #0d47a1; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>❌ Proposta Não Aceita</h1>
            </div>
            <div class="content">
                <p>Olá <strong>${nome}</strong>,</p>
                
                <div class="rejected-box">
                    <h3>❌ Proposta não aceita</h3>
                    <p>A proposta do cliente <strong>${cliente}</strong> não foi aceita pela operadora.</p>
                    <p><strong>Proposta:</strong> ${proposta}</p>
                </div>
                
                <div class="support-box">
                    <h4>📞 Precisa de ajuda?</h4>
                    <p>Entre em contato com nosso suporte para mais informações e orientações sobre os próximos passos.</p>
                </div>
                
                <p><strong>O que você pode fazer:</strong></p>
                <ul>
                    <li>Entrar em contato com nosso suporte</li>
                    <li>Revisar os dados da proposta com o cliente</li>
                    <li>Buscar alternativas de produtos que se adequem melhor</li>
                    <li>Submeter uma nova proposta se necessário</li>
                </ul>
                
                <p>Não desanime! Continue trabalhando e as aprovações virão. 💪</p>
            </div>
        </div>
    </body>
    </html>
  `
        break

      default:
        // Email padrão para cliente
        emailSubject = emailSubject || `Complete sua proposta de plano de saúde - ${nome}`
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <title>Complete sua Proposta</title>
              <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #168979 0%, #13786a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                  .button { display: inline-block; background: #168979; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; text-align: center; }
                  .highlight { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
                  .link-box { background: #f5f5f5; padding: 15px; border-radius: 5px; word-break: break-all; margin: 15px 0; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h1>🛡️ Complete sua Proposta</h1>
                  </div>
                  <div class="content">
                      <p>Olá <strong>${nome}</strong>,</p>
                      
                      <p>Seu corretor <strong>${corretor}</strong> iniciou uma proposta de plano de saúde para você!</p>
                      
                      <div class="highlight">
                          <h3>📋 Próximos passos:</h3>
                          <ol>
                              <li>Clique no botão abaixo para acessar sua proposta</li>
                              <li>Complete a declaração de saúde</li>
                              <li>Assine digitalmente o documento</li>
                              <li>Pronto! Sua proposta será enviada para análise</li>
                          </ol>
                      </div>
                      
                      <div style="text-align: center;">
                          <a href="${link}" class="button">
                              ✅ Completar Proposta
                          </a>
                      </div>
                      
                      <p><strong>Ou copie e cole este link no seu navegador:</strong></p>
                      <div class="link-box">
                          <a href="${link}">${link}</a>
                      </div>
                      
                      <p><small>Este link é pessoal e intransferível. Se você não solicitou esta proposta, pode ignorar este email.</small></p>
                  </div>
                  <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                      <p>© 2024 Contratando Planos - Este é um email automático</p>
                  </div>
              </div>
          </body>
          </html>
        `
        break
    }

    console.log("📤 Enviando email via Resend...")

    // Enviar email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: emailSubject,
        html: htmlContent,
      }),
    })

    console.log("📬 Resposta do Resend:", emailResponse.status)

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error("❌ Erro do Resend:", errorData)

      return new Response(
        JSON.stringify({
          error: "Erro ao enviar email via Resend",
          status: emailResponse.status,
          details: errorData,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    const result = await emailResponse.json()
    console.log("✅ Email enviado com sucesso:", result.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email enviado com sucesso",
        id: result.id,
        to: to,
        subject: emailSubject,
        tipo: tipo,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("💥 Erro geral:", error)
    return new Response(
      JSON.stringify({
        error: "Erro interno do servidor",
        message: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
})
