import type { Question, Language } from "@shared/schema";

interface MockAnswer {
  questionKey: string;
  lang: Language;
  answerText: string;
  citations: string[];
  hasIssues?: {
    incorrect?: boolean;
    outdated?: boolean;
    ungrounded?: boolean;
  };
}

// Mock LLM responses that simulate various issues for testing
const mockAnswers: MockAnswer[] = [
  // Phone - correct answers
  {
    questionKey: "city_hall_phone",
    lang: "fr",
    answerText: "Le numero de telephone de la mairie de Demoville est +32 2 123 45 67. [Source: site officiel]",
    citations: ["/data/sources/city_hall.md"],
  },
  {
    questionKey: "city_hall_phone",
    lang: "nl",
    answerText: "Het telefoonnummer van het gemeentehuis van Demoville is +32 2 123 45 67. [Bron: officiele website]",
    citations: ["/data/sources/city_hall.md"],
  },
  // Address - drift issue (different format)
  {
    questionKey: "city_hall_address",
    lang: "fr",
    answerText: "La mairie se trouve a la Grand-Place 1, 1000 Bruxelles.",
    citations: ["/data/sources/city_hall.md"],
  },
  {
    questionKey: "city_hall_address",
    lang: "nl",
    answerText: "Het gemeentehuis bevindt zich op Grote Markt 1, 1000 Brussel.",
    citations: ["/data/sources/city_hall.md"],
  },
  // Hours - outdated issue
  {
    questionKey: "city_hall_hours",
    lang: "fr",
    answerText: "La mairie est ouverte du lundi au vendredi de 09:00 a 17:00.",
    citations: [],
    hasIssues: { outdated: true, ungrounded: true },
  },
  {
    questionKey: "city_hall_hours",
    lang: "nl",
    answerText: "Het gemeentehuis is open van maandag tot vrijdag van 08:30 tot 16:30. [Bron: officiele website]",
    citations: ["/data/sources/city_hall.md"],
  },
  // ID card deadline - incorrect value
  {
    questionKey: "id_card_deadline",
    lang: "fr",
    answerText: "Vous devez renouveler votre carte d'identite 60 jours avant son expiration.",
    citations: [],
    hasIssues: { incorrect: true, ungrounded: true },
  },
  {
    questionKey: "id_card_deadline",
    lang: "nl",
    answerText: "U moet uw identiteitskaart 30 dagen voor de vervaldatum vernieuwen. [Bron: ID-kaart info]",
    citations: ["/data/sources/id_card.md"],
  },
  // ID card fee - correct
  {
    questionKey: "id_card_fee",
    lang: "fr",
    answerText: "Une nouvelle carte d'identite coute 25,00 EUR. [Source: tarifs municipaux]",
    citations: ["/data/sources/id_card.md"],
  },
  {
    questionKey: "id_card_fee",
    lang: "nl",
    answerText: "Een nieuwe identiteitskaart kost 25,00 EUR. [Bron: gemeentelijke tarieven]",
    citations: ["/data/sources/id_card.md"],
  },
  // Passport docs - ungrounded
  {
    questionKey: "passport_docs",
    lang: "fr",
    answerText: "Pour un passeport, vous avez besoin d'une photo, de votre ancienne carte et d'un justificatif.",
    citations: [],
    hasIssues: { ungrounded: true },
  },
  {
    questionKey: "passport_docs",
    lang: "nl",
    answerText: "Voor een paspoort heeft u een pasfoto, oude identiteitskaart en bewijs van woonplaats nodig. [Bron: paspoort info]",
    citations: ["/data/sources/passport.md"],
  },
  // Appointment URL - drift (different URLs)
  {
    questionKey: "online_appointment_url",
    lang: "fr",
    answerText: "Prenez rendez-vous sur https://rendezvous.demoville.be/fr [Source: site officiel]",
    citations: ["/data/sources/appointments.md"],
  },
  {
    questionKey: "online_appointment_url",
    lang: "nl",
    answerText: "Maak een afspraak via https://afspraken.demoville.be/nl [Bron: officiele website]",
    citations: ["/data/sources/appointments.md"],
  },
];

export interface LLMResponse {
  answerText: string;
  citations: string[];
}

export class MockLLMProvider {
  async getAnswer(question: Question): Promise<LLMResponse> {
    // Find matching mock answer
    const expectedKey = question.expectedFactKeys[0];
    const mockAnswer = mockAnswers.find(
      (a) => a.questionKey === expectedKey && a.lang === question.lang
    );

    if (mockAnswer) {
      return {
        answerText: mockAnswer.answerText,
        citations: mockAnswer.citations,
      };
    }

    // Default fallback response
    return {
      answerText: `Je ne dispose pas d'informations specifiques pour repondre a cette question sur "${question.topic}".`,
      citations: [],
    };
  }
}

export const mockLlmProvider = new MockLLMProvider();
