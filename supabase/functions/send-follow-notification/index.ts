
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FollowNotificationRequest {
  followerId: string;
  followingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { followerId, followingId }: FollowNotificationRequest = await req.json();

    console.log(`Processing follow notification: ${followerId} -> ${followingId}`);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer les informations du follower et du user suivi
    const [followerResult, followingResult] = await Promise.all([
      supabase.from('profiles').select('username, email').eq('id', followerId).single(),
      supabase.from('profiles').select('username, email').eq('id', followingId).single()
    ]);

    if (followerResult.error || followingResult.error) {
      console.error('Error fetching user profiles:', { followerResult, followingResult });
      throw new Error('Unable to fetch user profiles');
    }

    const follower = followerResult.data;
    const following = followingResult.data;

    // Déterminer les noms d'affichage
    const followerName = follower.username || follower.email?.split('@')[0] || 'Un utilisateur';
    const followingName = following.username || following.email?.split('@')[0] || 'Vous';

    // Envoyer l'email de notification
    const emailResponse = await resend.emails.send({
      from: "Notifications <onboarding@resend.dev>",
      to: [following.email],
      subject: "Read : quelqu'un s'est abonné à votre profil",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B4513; font-size: 28px; margin-bottom: 10px;">📚 Nouvelle notification</h1>
            <p style="color: #6B7280; font-size: 16px; margin: 0;">Quelqu'un s'intéresse à vos lectures !</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #F3E8D5 0%, #E6D3B7 100%); border-radius: 12px; padding: 30px; margin-bottom: 25px; text-align: center;">
            <div style="background-color: #8B4513; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 24px;">
              👤
            </div>
            <h2 style="color: #8B4513; font-size: 24px; margin-bottom: 15px;">
              ${followerName} s'est abonné(e) à votre profil !
            </h2>
            <p style="color: #8B4513; font-size: 16px; margin-bottom: 25px; line-height: 1.5;">
              Vous avez un nouveau lecteur qui suit vos aventures littéraires. 
              C'est le moment parfait pour découvrir ce qu'il/elle lit !
            </p>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${supabaseUrl.replace('https://', 'https://').replace('.supabase.co', '')}.lovable.app/profile/${followerId}" 
               style="background-color: #8B4513; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
              Voir le profil de ${followerName}
            </a>
          </div>

          <div style="background-color: #F9FAFB; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #374151; font-size: 18px; margin-bottom: 15px;">💡 Suggestions :</h3>
            <ul style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>Consultez ses livres favoris pour des recommandations</li>
              <li>Découvrez ses lectures en cours</li>
              <li>Échangez sur vos lectures communes</li>
            </ul>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              Vous recevez cet email car quelqu'un s'est abonné à votre profil.<br>
              <a href="${supabaseUrl.replace('https://', 'https://').replace('.supabase.co', '')}.lovable.app/profile" style="color: #8B4513; text-decoration: none;">
                Gérer mes paramètres de notification
              </a>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Follow notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-follow-notification function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
