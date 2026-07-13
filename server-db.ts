import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, doc, setDoc, getDoc, getDocs, collection, 
  deleteDoc, query, where, limit 
} from 'firebase/firestore';
import { 
  User, Paper, Folder, ChatSession, Note, Flashcard, 
  Quiz, LiteratureReview, SavedCitation, StudyActivity, DashboardMetrics 
} from './src/types';

const DB_FILE = path.join(process.cwd(), 'src', 'db.json');

// Ensure parent directories exist
const dbDir = path.dirname(DB_FILE);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Parse environment variables with priority on Firebase config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
};

const isFirebaseConfigured = !!firebaseConfig.apiKey;

let firebaseApp: any = null;
let firestoreDb: any = null;

if (isFirebaseConfigured) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestoreDb = getFirestore(firebaseApp);
    console.log("Firebase App initialized successfully on server-db.");
  } catch (err: any) {
    console.error("Firebase App initialization failed on server-db:", err.message || err);
  }
} else {
  console.warn("Firebase config is missing or incomplete. Using local db.json fallback.");
}

// Initial Seeding Data
const INITIAL_USERS: User[] = [
  {
    id: 'u-1',
    name: 'Aarav Sharma',
    email: 'aarav@university.edu',
    role: 'student',
    enrolledAt: '2026-01-10T10:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'u-2',
    name: 'Dr. Meera Iyer',
    email: 'meera.iyer@university.edu',
    role: 'professor',
    enrolledAt: '2025-08-15T09:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'u-3',
    name: 'Rahul Patel',
    email: 'rahul.ml@tech.co',
    role: 'researcher',
    enrolledAt: '2025-11-20T14:30:00Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
  }
];

const INITIAL_FOLDERS: Folder[] = [
  {
    id: 'f-1',
    name: 'Deep Learning Architectures',
    description: 'Core papers describing deep neural networks and attention mechanisms.',
    color: '#3B82F6', // Blue
    userId: 'u-1',
    createdAt: '2026-07-10T09:15:00Z'
  },
  {
    id: 'f-2',
    name: 'Natural Language Processing',
    description: 'Language modeling, pretraining, and tokenization techniques.',
    color: '#10B981', // Emerald
    userId: 'u-1',
    createdAt: '2026-07-11T11:45:00Z'
  },
  {
    id: 'f-3',
    name: 'Information Retrieval & RAG',
    description: 'Papers on combining document search with generative models.',
    color: '#F59E0B', // Amber
    userId: 'u-1',
    createdAt: '2026-07-12T16:20:00Z'
  }
];

// Rich seeded text of Attention Is All You Need
const ATTENTION_TEXT = `
[Page 1: Title & Abstract]
Attention Is All You Need
Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin
Google Brain / Google Research / University of Toronto
Abstract: The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results by over 2 BLEU.

[Page 2: Introduction]
1 Introduction
Recurrent neural networks (RNNs), long short-term memory (LSTM) and gated recurrent (GRU) neural networks in particular, have been firmly established as state-of-the-art approaches in sequence modeling and transduction problems such as language modeling and machine translation. Recurrent models factor computation along the symbol positions of the input and output sequences. Aligning the positions to steps in computation time, they generate a sequence of hidden states h_t, as a function of the previous hidden state h_{t-1} and the input for position t. This inherently sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths, as memory constraints limit batching across examples. Recent work has achieved significant improvements in computational efficiency through factorization tricks and conditional computation, while the fundamental constraint of sequential computation remains. 

[Page 3: Background & Architecture]
2 Background
The goal of reducing sequential computation also forms the foundation of Extended Neural GPU, ByteNet and ConvS2S, all of which use convolutional neural networks as basic building block, computing parallel representations for all input and output positions. In these models, the number of operations required to relate signals from two arbitrary input or output positions grows in the distance between positions, linearly for ConvS2S and logarithmically for ByteNet. This makes it more difficult to learn dependencies between distant positions. In the Transformer, this is reduced to a constant number of operations, albeit at the cost of reduced effective resolution due to averaging attention-weighted positions, an effect we counteract with Multi-Head Attention.
3 Model Architecture
Most competitive neural sequence transduction models have an encoder-decoder structure. Here, the encoder maps an input sequence of symbol representations (x_1, ..., x_n) to a sequence of continuous representations z = (z_1, ..., z_n). Given z, the decoder then generates an output sequence (y_1, ..., y_m) of symbols one element at a time. At each step the model is auto-regressive, consuming the previously generated symbols as additional input when generating the next.

[Page 4: Encoder-Decoder Blocks]
3.1 Encoder and Decoder Stacks
Encoder: The encoder is composed of a stack of N = 6 identical layers. Each layer has two sub-layers. The first is a multi-head self-attention mechanism, and the second is a simple, position-wise fully connected feed-forward network. We employ a residual connection around each of the two sub-layers, followed by layer normalization. That is, the output of each sub-layer is LayerNorm(x + Sublayer(x)), where Sublayer(x) is the function implemented by the sub-layer itself. To facilitate these residual connections, all sub-layers in the model, as well as the embedding layers, produce outputs of dimension d_model = 512.
Decoder: The decoder is also composed of a stack of N = 6 identical layers. In addition to the two sub-layers in each encoder layer, the decoder inserts a third sub-layer, which performs multi-head attention over the output of the encoder stack. Similar to the encoder, we employ residual connections around each of the sub-layers, followed by layer normalization. We also modify the self-attention sub-layer in the decoder stack to prevent positions from attending to subsequent positions. This masking, combined with fact that the output embeddings are offset by one position, ensures that the predictions for position i can depend only on the known outputs at positions less than i.

[Page 5: Attention Mechanism]
3.2 Attention
An attention function can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors. The output is computed as a weighted sum of the values, where the weight assigned to each value is computed by a compatibility function of the query with the corresponding key.
Scaled Dot-Product Attention: We call our particular attention "Scaled Dot-Product Attention". The input consists of queries and keys of dimension d_k, and values of dimension d_v. We compute the dot products of the query with all keys, divide each by sqrt(d_k), and apply a softmax function to obtain the weights on the values. In practice, we compute the attention function on a set of queries simultaneously, packed together into a matrix Q. The keys and values are also packed into matrices K and V. We compute the matrix of outputs as:
Attention(Q, K, V) = softmax( (Q K^T) / sqrt(d_k) ) V.

[Page 6: Multi-Head Attention & Applications]
3.2.2 Multi-Head Attention
Instead of performing a single attention function with d_model-dimensional queries, keys and values, we found it beneficial to linearly project the queries, keys and values h times with different, learned linear projections to d_k, d_k and d_v dimensions, respectively. On each of these projected versions of queries, keys and values we then perform the attention function in parallel, yielding d_v-dimensional output values. These are concatenated and once again projected, resulting in the final values.
Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. With a single attention head, averaging inhibits this.
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) W^O
where head_i = Attention(Q W_i^Q, K W_i^K, V W_i^V).
In this work we employ h = 8 parallel attention layers, or heads. For each of these we use d_k = d_v = d_model / h = 64. Due to the reduced dimension of each head, the total computational cost is similar to that of single-head attention with full dimensionality.
`;

const BERT_TEXT = `
[Page 1: Title & Abstract]
BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding
Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova
Google AI Language
Abstract: We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers. As a result, the pre-trained BERT model can be fine-tuned with just one additional output layer to create state-of-the-art models for a wide range of tasks, such as question answering and language inference, without substantial task-specific architecture modifications. BERT is conceptually simple and empirically powerful. It obtains new state-of-the-art results on eleven natural language processing tasks, including pushing the GLUE score to 80.5% (7.7% absolute improvement) and MultiNLI accuracy to 86.7%.

[Page 2: Introduction]
1 Introduction
Language model pre-training has been shown to be effective for improving many natural language processing tasks. These include sentence-level tasks such as natural language inference and paraphrasing, which predict the relationships between sentences by analyzing them holistically, as well as token-level tasks such as named entity recognition and question answering, where models are required to produce fine-grained output at the token level.
There are two existing strategies for applying pre-trained language representations to downstream tasks: feature-based and fine-tuning. The feature-based approach, such as ELMo, uses task-specific architectures that include pre-trained representations as additional features. The fine-tuning approach, such as the Generative Pre-trained Transformer (OpenAI GPT), introduces minimal task-specific parameters, and is trained on the downstream tasks by simply fine-tuning all pre-trained parameters.

[Page 3: Bidirectional Limitation & Proposed Solution]
1.1 Bidirectional Limitations
A major limitation of current pre-trained language models is that standard language models are unidirectional, and this limits the choice of architectures that can be used during pre-training. For example, in OpenAI GPT, the authors use a left-to-right architecture, where every token can only attend to previous tokens in the self-attention layers of the Transformer. Such restrictions are sub-optimal for sentence-level tasks, and could be very harmful when applying fine-tuning based approaches to token-level tasks such as question answering, where it is crucial to incorporate context from both directions.
In this paper, we improve the fine-tuning based approaches by proposing BERT: Bidirectional Encoder Representations from Transformers. BERT alleviates the unidirectionality constraint by using a "Masked Language Model" (MLM) pre-training objective, inspired by the Cloze task.

[Page 4: Masked Language Model]
2 Model Architecture & MLM
BERT’s model architecture is a multi-layer bidirectional Transformer encoder based on the original implementation described in Vaswani et al. (2017). We denote the number of layers (i.e., Transformer blocks) as L, the hidden size as H, and the number of self-attention heads as A.
We present two model sizes:
- BERT-BASE: L=12, H=768, A=12, Total Parameters=110M
- BERT-LARGE: L=24, H=1024, A=16, Total Parameters=340M
The Masked Language Model (MLM): In order to train a deep bidirectional representation, we simply mask a random percentage of the input tokens, and then predict those masked tokens. We refer to this procedure as a "masked LM" (MLM). In this case, the final hidden vectors corresponding to the mask tokens are fed into an output softmax over the vocabulary, as in a standard LM. In all of our experiments, we mask 15% of all WordPiece tokens in each sequence at random.

[Page 5: Next Sentence Prediction]
2.2 Next Sentence Prediction (NSP)
Many important downstream tasks such as Question Answering (QA) and Natural Language Inference (NLI) are based on understanding the relationship between two sentences, which is not directly captured by language modeling.
In order to train a model that understands sentence relationships, we pre-train for a binarized next sentence prediction task that can be trivially generated from any monolingual corpus. Specifically, when choosing the sentences A and B for each training example, 50% of the time B is the actual next sentence that follows A (labeled as IsNext), and 50% of the time it is a random sentence from the corpus (labeled as NotNext). For the final pre-trained model, the NSP task helps achieve significant performance gains on QA and NLI tasks.
`;

const RAG_TEXT = `
[Page 1: Title & Abstract]
Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks
Patrick Lewis, Ethan Perez, Aleksandara Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Wen-tau Yih, Tim Rocktäschel, Sebastian Riedel, Douwe Kiela
Facebook AI Research / University College London / New York University
Abstract: Pre-trained neural language models have been shown to store implicit knowledge in their parameters, and achieve state-of-the-art results when fine-tuned on downstream NLP tasks. However, their ability to access and precisely manipulate knowledge is still limited, and hence on knowledge-intensive tasks, their performance falls behind task-specific architectures. Additionally, providing provenance for their decisions and updating their world knowledge remain open challenges. We introduce retrieval-augmented generation (RAG) models for knowledge-intensive NLP tasks—models which combine pre-trained parametric and non-parametric memory. RAG can be fine-tuned end-to-end, showing strong performance across open-domain QA, abstractive QA, and jeopardy generation tasks.

[Page 2: Introduction]
1 Introduction
Pre-trained language models like BERT and GPT learn deep representations of language but suffer from fundamental issues: they cannot easily expand or revise their memory, can hallucinate facts, and lack interpretability. In contrast, hybrid parametric and non-parametric models combine a neural generator with a non-parametric dense vector index of a text corpus. This allows the model to retrieve relevant passages from a external knowledge source (like Wikipedia) and incorporate them into the generation process.
In this work, we propose Retrieval-Augmented Generation (RAG). RAG combines a dense passage retriever (DPR) as the non-parametric memory, with a pre-trained sequence-to-sequence model (BART) as the parametric memory.

[Page 3: RAG Formulations]
2 Methods & Architectures
We study two formulations of RAG: RAG-Sequence and RAG-Token.
RAG-Sequence Model: In RAG-Sequence, the model uses the same retrieved document to generate the complete sequence. Specifically, the retriever returns top-K documents, and the generator produces the output sequence conditioned on each document individually. The final probability of the output sequence is computed by marginalizing over the top-K retrieved documents.
RAG-Token Model: In RAG-Token, the model can retrieve and attend to different documents for each token in the generated output. This allows the generator to synthesize content drawing on details from multiple source documents simultaneously.

[Page 4: Retriever & Generator]
2.1 Non-Parametric Memory: DPR
The retriever query encoder and document encoder are trained using Dense Passage Retrieval (DPR). DPR uses a bi-encoder architecture:
d(x) = Multi-Layer-Transformer_Q(x)
d(z) = Multi-Layer-Transformer_D(z)
The similarity score is computed as the dot product: similarity(x, z) = d(x)^T d(z). The retriever retrieves the top-K documents with the highest similarity scores relative to the input query x.
2.2 Parametric Memory: BART
For the generator, we use BART-large, a pre-trained sequence-to-sequence Transformer with 400M parameters. When generating, BART takes the concatenation of the original query x and the retrieved document text z, and generates tokens auto-regressively.
`;

const INITIAL_PAPERS: Paper[] = [
  {
    id: 'p-1',
    title: 'Attention Is All You Need',
    authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin',
    journal: 'Advances in Neural Information Processing Systems (NeurIPS)',
    year: 2017,
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
    folderId: 'f-1',
    isBookmarked: true,
    uploadedAt: '2026-07-10T10:00:00Z',
    fileType: 'application/pdf',
    size: '2.1 MB',
    content: ATTENTION_TEXT,
    pages: ATTENTION_TEXT.split('[Page ').filter(Boolean).map(p => {
      const closingBracketIndex = p.indexOf(']');
      return p.substring(closingBracketIndex + 1).trim();
    }),
    citations: {
      apa: 'Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). Attention is all you need. Advances in Neural Information Processing Systems, 30, 5998–6008.',
      mla: 'Vaswani, Ashish, et al. "Attention is all you need." Advances in Neural Information Processing Systems, vol. 30, 2017, pp. 5998-6008.',
      chicago: 'Vaswani, Ashish, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, and Illia Polosukhin. "Attention is all you need." Advances in Neural Information Processing Systems 30 (2017): 5998-6008.',
      harvard: 'Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A.N., Kaiser, Ł. and Polosukhin, I., 2017. Attention is all you need. Advances in Neural Information Processing Systems, 30, pp. 5998-6008.',
      bibtex: `@inproceedings{vaswani2017attention,
  title={Attention is all you need},
  author={Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and Uszkoreit, Jakob and Jones, Llion and Gomez, Aidan N and Kaiser, {\\L}ukasz and Polosukhin, Illia},
  booktitle={Advances in Neural Information Processing Systems},
  volume={30},
  pages={5998--6008},
  year={2017}
}`
    },
    readingProgress: 85
  },
  {
    id: 'p-2',
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: 'Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova',
    journal: 'Association for Computational Linguistics (NAACL-HLT)',
    year: 2019,
    abstract: 'We introduce a new language representation model called BERT. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.',
    folderId: 'f-2',
    isBookmarked: false,
    uploadedAt: '2026-07-11T12:00:00Z',
    fileType: 'application/pdf',
    size: '1.4 MB',
    content: BERT_TEXT,
    pages: BERT_TEXT.split('[Page ').filter(Boolean).map(p => {
      const closingBracketIndex = p.indexOf(']');
      return p.substring(closingBracketIndex + 1).trim();
    }),
    citations: {
      apa: 'Devlin, J., Chang, M. W., Lee, K., & Toutanova, K. (2018). BERT: Pre-training of deep bidirectional transformers for language understanding. arXiv preprint arXiv:1810.04805.',
      mla: 'Devlin, Jacob, et al. "BERT: Pre-training of deep bidirectional transformers for language understanding." arXiv preprint arXiv:1810.04805 (2018).',
      chicago: 'Devlin, Jacob, Ming-Wei Chang, Kenton Lee, and Kristina Toutanova. "BERT: Pre-training of deep bidirectional transformers for language understanding." arXiv preprint arXiv:1810.04805 (2018).',
      harvard: 'Devlin, J., Chang, M.W., Lee, K. and Toutanova, K., 2018. BERT: Pre-training of deep bidirectional transformers for language understanding. arXiv preprint arXiv:1810.04805.',
      bibtex: `@article{devlin2018bert,
  title={BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding},
  author={Devlin, Jacob and Chang, Ming-Wei and Lee, Kenton and Toutanova, Kristina},
  journal={arXiv preprint arXiv:1810.04805},
  year={2018}
}`
    },
    readingProgress: 40
  },
  {
    id: 'p-3',
    title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
    authors: 'Patrick Lewis, Ethan Perez, Aleksandara Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Wen-tau Yih, Tim Rocktäschel, Sebastian Riedel, Douwe Kiela',
    journal: 'Advances in Neural Information Processing Systems (NeurIPS)',
    year: 2020,
    abstract: 'We introduce retrieval-augmented generation (RAG) models for knowledge-intensive NLP tasks—models which combine pre-trained parametric and non-parametric memory. RAG can be fine-tuned end-to-end, showing strong performance across open-domain QA and jeopardy generation.',
    folderId: 'f-3',
    isBookmarked: true,
    uploadedAt: '2026-07-12T17:00:00Z',
    fileType: 'application/pdf',
    size: '3.5 MB',
    content: RAG_TEXT,
    pages: RAG_TEXT.split('[Page ').filter(Boolean).map(p => {
      const closingBracketIndex = p.indexOf(']');
      return p.substring(closingBracketIndex + 1).trim();
    }),
    citations: {
      apa: 'Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., ... & Kiela, D. (2020). Retrieval-augmented generation for knowledge-intensive nlp tasks. Advances in Neural Information Processing Systems, 33, 9459-9474.',
      mla: 'Lewis, Patrick, et al. "Retrieval-augmented generation for knowledge-intensive nlp tasks." Advances in Neural Information Processing Systems, vol. 33, 2020, pp. 9459-9474.',
      chicago: 'Lewis, Patrick, Ethan Perez, Aleksandara Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, et al. "Retrieval-augmented generation for knowledge-intensive nlp tasks." Advances in Neural Information Processing Systems 33 (2020): 9459-9474.',
      harvard: 'Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W.T., Rocktäschel, T. and Riedel, S., 2020. Retrieval-augmented generation for knowledge-intensive nlp tasks. Advances in Neural Information Processing Systems, 33, pp. 9459-9474.',
      bibtex: `@article{lewis2020retrieval,
  title={Retrieval-augmented generation for knowledge-intensive nlp tasks},
  author={Lewis, Patrick and Perez, Ethan and Piktus, Aleksandara and Petroni, Fabio and Karpukhin, Vladimir and Goyal, Naman and K{\\"u}ttler, Heinrich and Lewis, Mike and Yih, Wen-tau and Rockt{\\"a}schel, Tim and others},
  journal={Advances in Neural Information Processing Systems},
  volume={33},
  pages={9459--9474},
  year={2020}
}`
    },
    readingProgress: 100
  }
];

const INITIAL_NOTES: Note[] = [
  {
    id: 'n-1',
    paperId: 'p-1',
    title: 'Transformer Core Mechanics',
    content: 'The core contribution is replacing LSTM sequential cells with Multi-Head Self-Attention. Key formulas:\n1. Scaled Dot-Product Attention: softmax(Q K^T / sqrt(d_k)) V\n2. d_model is 512, with h=8 heads. d_k = d_v = 64.\nThis allows constant path length for dependencies of arbitrary distance, resolving LSTM limitations.',
    updatedAt: '2026-07-10T10:30:00Z'
  },
  {
    id: 'n-2',
    paperId: 'p-2',
    title: 'BERT Objectives Analysis',
    content: 'BERT relies on two core pre-training objectives:\n- Masked Language Model (MLM): Masks 15% of words at random. Alleviates bidirectionality constraints.\n- Next Sentence Prediction (NSP): Binary classification (IsNext vs NotNext) to learn sentence-to-sentence relations. Critical for QA and Natural Language Inference.',
    updatedAt: '2026-07-11T12:45:00Z'
  }
];

const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    paperId: 'p-1',
    question: 'What is the main limitation of LSTMs/RNNs that the Transformer solves?',
    answer: 'The inherently sequential nature of LSTMs/RNNs prevents parallelization during training, which becomes critical for long sequences. The Transformer allows fully parallel computations across all token positions.',
    difficulty: 'easy'
  },
  {
    id: 'fc-2',
    paperId: 'p-1',
    question: 'Write the mathematical formula for Scaled Dot-Product Attention.',
    answer: 'Attention(Q, K, V) = softmax( (Q K^T) / sqrt(d_k) ) V',
    difficulty: 'medium'
  },
  {
    id: 'fc-3',
    paperId: 'p-2',
    question: 'What does MLM stand for in the context of BERT, and why is it used?',
    answer: 'MLM stands for Masked Language Model. It randomly masks 15% of input tokens and predicts them, allowing the model to learn deep bidirectional representations by conditioning on both left and right context.',
    difficulty: 'medium'
  },
  {
    id: 'fc-4',
    paperId: 'p-3',
    question: 'What are the two proposed formulations of RAG?',
    answer: 'RAG-Sequence (retrieves a set of documents and uses the same document to generate the entire sequence) and RAG-Token (retrieves documents and can attend to different documents for each generated token).',
    difficulty: 'hard'
  }
];

const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'q-1',
    paperId: 'p-1',
    title: 'Transformer Core Architecture Quiz',
    questions: [
      {
        question: 'How many identical layers (N) are in the stack of the standard Transformer Encoder?',
        options: ['4 layers', '6 layers', '8 layers', '12 layers'],
        answerIndex: 1,
        explanation: 'The paper specifies that both the Encoder and Decoder stacks use N = 6 identical layers.'
      },
      {
        question: 'What is the dimension size (d_model) of the embedding and sub-layer outputs in the Transformer?',
        options: ['128', '256', '512', '1024'],
        answerIndex: 2,
        explanation: 'All sub-layers and embedding layers produce outputs of dimension d_model = 512 to facilitate residual connections.'
      },
      {
        question: 'In Multi-Head Attention with h=8 heads and d_model=512, what is the dimension (d_k) of each attention head?',
        options: ['32', '64', '128', '512'],
        answerIndex: 1,
        explanation: 'd_k = d_model / h. Hence, 512 / 8 = 64. Each head operates on a projected 64-dimensional subspace.'
      }
    ],
    score: 100,
    takenAt: '2026-07-12T14:00:00Z'
  },
  {
    id: 'q-2',
    paperId: 'p-2',
    title: 'BERT Foundations Assessment',
    questions: [
      {
        question: 'What is the percentage of WordPiece tokens masked at random for the Masked Language Model (MLM) objective?',
        options: ['10%', '15%', '20%', '25%'],
        answerIndex: 1,
        explanation: 'In all BERT pre-training experiments, 15% of all WordPiece tokens are masked at random.'
      },
      {
        question: 'Which of the following describes the NSP task in BERT?',
        options: [
          'Negative Sentence Prediction',
          'Next Word Optimization',
          'Next Sentence Prediction',
          'Non-parametric Sequence Processing'
        ],
        answerIndex: 2,
        explanation: 'NSP stands for Next Sentence Prediction, where the model classifies whether Sentence B follows Sentence A.'
      }
    ]
  }
];

const INITIAL_LITERATURE_REVIEWS: LiteratureReview[] = [
  {
    id: 'lr-1',
    title: 'Evolution of Transformers: Pre-training to Dense Retrieval Grounding',
    papers: ['p-1', 'p-2', 'p-3'],
    synthesisTable: [
      {
        heading: 'Core Architecture Contribution',
        values: {
          'p-1': 'Dispenses with recurrence and convolution, utilizing solely self-attention.',
          'p-2': 'Bidirectional Transformer Encoder pretraining with Masked Language Modeling (MLM).',
          'p-3': 'Combines a Dense Passage Retriever (DPR) with a BART sequence-to-sequence generator.'
        }
      },
      {
        heading: 'Knowledge Retention & Memory Type',
        values: {
          'p-1': 'Purely parametric memory trained for sequence-to-sequence mapping.',
          'p-2': 'Implicit parametric memory learned via bidirectional MLM and NSP pretraining.',
          'p-3': 'Hybrid memory: non-parametric index memory (DPR) combined with parametric generation memory (BART).'
        }
      },
      {
        heading: 'Primary Limitation Solved',
        values: {
          'p-1': 'Sequential computing limits parallelization and distant context dependency.',
          'p-2': 'Left-to-right (unidirectional) language models are sub-optimal for sentence representation.',
          'p-3': 'Parametric neural models hallucinate, cannot easily update world facts, and lack provenance.'
        }
      }
    ],
    summary: 'This review details the trajectory of modern NLP architectures starting from the standard self-attention block (Transformer, 2017), expanding to deep bidirectional language pretraining (BERT, 2018), and eventually merging parametric generation models with non-parametric corpus retrieval indexes (RAG, 2020). It outlines how memory evolved from pure translation parameters to hybrid retrieval systems grounded in real-time knowledge.',
    gapAnalysis: 'While RAG resolves parametric memory hallucination issues, current systems rely on static non-parametric document corpora (e.g., historical Wikipedia indices). Research gaps exist in real-time continuous document stream integration, low-latency dense vector updating, and handling conflicting sources dynamically inside the generator context.',
    createdAt: '2026-07-12T18:30:00Z'
  }
];

const INITIAL_SAVED_CITATIONS: SavedCitation[] = [
  {
    id: 'sc-1',
    paperId: 'p-1',
    paperTitle: 'Attention Is All You Need',
    format: 'apa',
    citationText: 'Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). Attention is all you need. Advances in Neural Information Processing Systems, 30, 5998–6008.',
    savedAt: '2026-07-10T10:15:00Z'
  },
  {
    id: 'sc-2',
    paperId: 'p-2',
    paperTitle: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    format: 'bibtex',
    citationText: `@article{devlin2018bert,
  title={BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding},
  author={Devlin, Jacob and Chang, Ming-Wei and Lee, Kenton and Toutanova, Kristina},
  journal={arXiv preprint arXiv:1810.04805},
  year={2018}
}`,
    savedAt: '2026-07-11T12:05:00Z'
  }
];

const INITIAL_STUDY_ACTIVITIES: StudyActivity[] = [
  {
    id: 'sa-1',
    userId: 'u-1',
    type: 'read',
    paperTitle: 'Attention Is All You Need',
    paperId: 'p-1',
    detail: 'Read pages 1-3 and bookmarked core model architecture.',
    timestamp: '2026-07-10T10:20:00Z'
  },
  {
    id: 'sa-2',
    userId: 'u-1',
    type: 'note',
    paperTitle: 'Attention Is All You Need',
    paperId: 'p-1',
    detail: 'Created detailed study note: "Transformer Core Mechanics".',
    timestamp: '2026-07-10T10:31:00Z'
  },
  {
    id: 'sa-3',
    userId: 'u-1',
    type: 'flashcard',
    paperTitle: 'BERT Pre-training',
    paperId: 'p-2',
    detail: 'Reviewed 3 vocabulary cards for MLM concepts.',
    timestamp: '2026-07-11T12:50:00Z'
  },
  {
    id: 'sa-4',
    userId: 'u-1',
    type: 'quiz',
    paperTitle: 'Attention Is All You Need',
    paperId: 'p-1',
    detail: 'Scored 100% on the core architecture assessment.',
    timestamp: '2026-07-12T14:02:00Z'
  }
];

interface DB {
  users: User[];
  folders: Folder[];
  papers: Paper[];
  notes: Note[];
  flashcards: Flashcard[];
  quizzes: Quiz[];
  chats: ChatSession[];
  literatureReviews: LiteratureReview[];
  savedCitations: SavedCitation[];
  activities: StudyActivity[];
}

class ServerDatabase {
  private db: DB;

  constructor() {
    this.db = this.load();
    if (isFirebaseConfigured) {
      console.log("Firebase detected. Initializing seeding...");
      this.seedFirestoreIfNeeded().catch(err => {
        console.error("Failed to seed Firestore:", err);
      });
    }
  }

  private load(): DB {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Error parsing db file, resetting to defaults.', err);
      }
    }

    const defaultDB: DB = {
      users: INITIAL_USERS,
      folders: INITIAL_FOLDERS,
      papers: INITIAL_PAPERS,
      notes: INITIAL_NOTES,
      flashcards: INITIAL_FLASHCARDS,
      quizzes: INITIAL_QUIZZES,
      chats: [],
      literatureReviews: INITIAL_LITERATURE_REVIEWS,
      savedCitations: INITIAL_SAVED_CITATIONS,
      activities: INITIAL_STUDY_ACTIVITIES
    };
    this.saveData(defaultDB);
    return defaultDB;
  }

  private saveData(data: DB) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  }

  private persist() {
    this.saveData(this.db);
  }

  // Seeding helper
  async seedFirestoreIfNeeded() {
    if (!firestoreDb) return;
    try {
      const papersSnap = await getDocs(collection(firestoreDb, 'papers'));
      if (papersSnap.empty) {
        console.log("Firestore collections are empty. Performing full seeding...");
        
        for (const u of INITIAL_USERS) {
          await setDoc(doc(firestoreDb, 'users', u.id), u);
        }
        for (const f of INITIAL_FOLDERS) {
          await setDoc(doc(firestoreDb, 'folders', f.id), f);
        }
        for (const p of INITIAL_PAPERS) {
          await setDoc(doc(firestoreDb, 'papers', p.id), p);
        }
        for (const n of INITIAL_NOTES) {
          await setDoc(doc(firestoreDb, 'notes', n.id), n);
        }
        for (const fc of INITIAL_FLASHCARDS) {
          await setDoc(doc(firestoreDb, 'flashcards', fc.id), fc);
        }
        for (const q of INITIAL_QUIZZES) {
          await setDoc(doc(firestoreDb, 'quizzes', q.id), q);
        }
        for (const lr of INITIAL_LITERATURE_REVIEWS) {
          await setDoc(doc(firestoreDb, 'literatureReviews', lr.id), lr);
        }
        for (const sc of INITIAL_SAVED_CITATIONS) {
          await setDoc(doc(firestoreDb, 'savedCitations', sc.id), sc);
        }
        for (const sa of INITIAL_STUDY_ACTIVITIES) {
          await setDoc(doc(firestoreDb, 'activities', sa.id), sa);
        }
        
        console.log("Firestore database seeded successfully.");
      }
    } catch (err: any) {
      console.error("Firestore Seeding failed:", err.message || err);
    }
  }

  // Auth Operations
  async getUsers(): Promise<User[]> {
    if (firestoreDb) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'users'));
        return snap.docs.map(doc => doc.data() as User);
      } catch (err: any) {
        console.error("Firestore getUsers error:", err.message);
      }
    }
    return this.db.users;
  }

  async getUser(id: string): Promise<User | undefined> {
    if (firestoreDb) {
      try {
        const snap = await getDoc(doc(firestoreDb, 'users', id));
        if (snap.exists()) {
          return snap.data() as User;
        }
      } catch (err: any) {
        console.error("Firestore getUser error:", err.message);
      }
    }
    return this.db.users.find(u => u.id === id);
  }

  async createUser(user: User): Promise<User> {
    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'users', user.id), user);
        return user;
      } catch (err: any) {
        console.error("Firestore createUser error:", err.message);
      }
    }
    this.db.users.push(user);
    this.persist();
    return user;
  }

  // Folder Operations
  async getFolders(): Promise<Folder[]> {
    if (firestoreDb) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'folders'));
        return snap.docs.map(doc => doc.data() as Folder);
      } catch (err: any) {
        console.error("Firestore getFolders error:", err.message);
      }
    }
    return this.db.folders;
  }

  async createFolder(folder: Folder): Promise<Folder> {
    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'folders', folder.id), folder);
        return folder;
      } catch (err: any) {
        console.error("Firestore createFolder error:", err.message);
      }
    }
    this.db.folders.push(folder);
    this.persist();
    return folder;
  }

  async deleteFolder(id: string): Promise<void> {
    if (firestoreDb) {
      try {
        await deleteDoc(doc(firestoreDb, 'folders', id));
        // Unassign paper folders in firestore
        const papersSnap = await getDocs(collection(firestoreDb, 'papers'));
        for (const paperDoc of papersSnap.docs) {
          const p = paperDoc.data() as Paper;
          if (p.folderId === id) {
            await setDoc(doc(firestoreDb, 'papers', p.id), { ...p, folderId: null });
          }
        }
        return;
      } catch (err: any) {
        console.error("Firestore deleteFolder error:", err.message);
      }
    }
    this.db.folders = this.db.folders.filter(f => f.id !== id);
    this.db.papers.forEach(p => {
      if (p.folderId === id) {
        p.folderId = null;
      }
    });
    this.persist();
  }

  // Paper Operations
  async getPapers(): Promise<Paper[]> {
    if (firestoreDb) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'papers'));
        return snap.docs.map(doc => doc.data() as Paper);
      } catch (err: any) {
        console.error("Firestore getPapers error:", err.message);
      }
    }
    return this.db.papers;
  }

  async getPaper(id: string): Promise<Paper | undefined> {
    if (firestoreDb) {
      try {
        const snap = await getDoc(doc(firestoreDb, 'papers', id));
        if (snap.exists()) {
          return snap.data() as Paper;
        }
      } catch (err: any) {
        console.error("Firestore getPaper error:", err.message);
      }
    }
    return this.db.papers.find(p => p.id === id);
  }

  async createPaper(paper: Paper): Promise<Paper> {
    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'papers', paper.id), paper);
        return paper;
      } catch (err: any) {
        console.error("Firestore createPaper error:", err.message);
      }
    }
    this.db.papers.push(paper);
    this.persist();
    return paper;
  }

  async updatePaper(id: string, updates: Partial<Paper>): Promise<Paper | undefined> {
    if (firestoreDb) {
      try {
        const snap = await getDoc(doc(firestoreDb, 'papers', id));
        if (snap.exists()) {
          const paper = { ...snap.data(), ...updates } as Paper;
          await setDoc(doc(firestoreDb, 'papers', id), paper);
          return paper;
        }
      } catch (err: any) {
        console.error("Firestore updatePaper error:", err.message);
      }
    }
    const paper = this.db.papers.find(p => p.id === id);
    if (paper) {
      Object.assign(paper, updates);
      this.persist();
    }
    return paper;
  }

  async deletePaper(id: string): Promise<void> {
    if (firestoreDb) {
      try {
        await deleteDoc(doc(firestoreDb, 'papers', id));
        
        // Delete related sub-resources in firestore
        const deleteRelation = async (colName: string) => {
          const snap = await getDocs(collection(firestoreDb, colName));
          for (const d of snap.docs) {
            const data = d.data();
            if (data.paperId === id) {
              await deleteDoc(doc(firestoreDb, colName, d.id));
            }
          }
        };
        await deleteRelation('notes');
        await deleteRelation('flashcards');
        await deleteRelation('quizzes');
        await deleteRelation('chats');
        await deleteRelation('savedCitations');
        return;
      } catch (err: any) {
        console.error("Firestore deletePaper error:", err.message);
      }
    }
    this.db.papers = this.db.papers.filter(p => p.id !== id);
    this.db.notes = this.db.notes.filter(n => n.paperId !== id);
    this.db.flashcards = this.db.flashcards.filter(f => f.paperId !== id);
    this.db.quizzes = this.db.quizzes.filter(q => q.paperId !== id);
    this.db.chats = this.db.chats.filter(c => c.paperId !== id);
    this.db.savedCitations = this.db.savedCitations.filter(c => c.paperId !== id);
    this.persist();
  }

  // Note Operations
  async getNotes(): Promise<Note[]> {
    if (firestoreDb) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'notes'));
        return snap.docs.map(doc => doc.data() as Note);
      } catch (err: any) {
        console.error("Firestore getNotes error:", err.message);
      }
    }
    return this.db.notes;
  }

  async getNoteForPaper(paperId: string): Promise<Note | undefined> {
    if (firestoreDb) {
      try {
        const qSnap = await getDocs(query(collection(firestoreDb, 'notes'), where('paperId', '==', paperId), limit(1)));
        if (!qSnap.empty) {
          return qSnap.docs[0].data() as Note;
        }
      } catch (err: any) {
        console.error("Firestore getNoteForPaper error:", err.message);
      }
    }
    return this.db.notes.find(n => n.paperId === paperId);
  }

  async createOrUpdateNote(paperId: string, title: string, content: string): Promise<Note> {
    if (firestoreDb) {
      try {
        const existingNote = await this.getNoteForPaper(paperId);
        const noteId = existingNote ? existingNote.id : `n-${Date.now()}`;
        const note: Note = {
          id: noteId,
          paperId,
          title,
          content,
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(firestoreDb, 'notes', noteId), note);
        return note;
      } catch (err: any) {
        console.error("Firestore createOrUpdateNote error:", err.message);
      }
    }
    let note = this.db.notes.find(n => n.paperId === paperId);
    if (note) {
      note.title = title;
      note.content = content;
      note.updatedAt = new Date().toISOString();
    } else {
      note = {
        id: `n-${Date.now()}`,
        paperId,
        title,
        content,
        updatedAt: new Date().toISOString()
      };
      this.db.notes.push(note);
    }
    this.persist();
    return note;
  }

  // Flashcard Operations
  async getFlashcards(paperId?: string): Promise<Flashcard[]> {
    if (firestoreDb) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'flashcards'));
        const allCards = snap.docs.map(doc => doc.data() as Flashcard);
        if (paperId) {
          return allCards.filter(f => f.paperId === paperId);
        }
        return allCards;
      } catch (err: any) {
        console.error("Firestore getFlashcards error:", err.message);
      }
    }
    if (paperId) {
      return this.db.flashcards.filter(f => f.paperId === paperId);
    }
    return this.db.flashcards;
  }

  async saveFlashcards(cards: Flashcard[]): Promise<void> {
    if (firestoreDb) {
      try {
        for (const card of cards) {
          await setDoc(doc(firestoreDb, 'flashcards', card.id), card);
        }
        return;
      } catch (err: any) {
        console.error("Firestore saveFlashcards error:", err.message);
      }
    }
    cards.forEach(card => {
      const idx = this.db.flashcards.findIndex(f => f.id === card.id);
      if (idx > -1) {
        this.db.flashcards[idx] = card;
      } else {
        this.db.flashcards.push(card);
      }
    });
    this.persist();
  }

  async updateFlashcardDifficulty(cardId: string, difficulty: 'easy' | 'medium' | 'hard' | null): Promise<Flashcard | undefined> {
    if (firestoreDb) {
      try {
        const snap = await getDoc(doc(firestoreDb, 'flashcards', cardId));
        if (snap.exists()) {
          const card = {
            ...snap.data(),
            difficulty,
            lastReviewed: new Date().toISOString()
          } as Flashcard;
          await setDoc(doc(firestoreDb, 'flashcards', cardId), card);
          return card;
        }
      } catch (err: any) {
        console.error("Firestore updateFlashcardDifficulty error:", err.message);
      }
    }
    const card = this.db.flashcards.find(f => f.id === cardId);
    if (card) {
      card.difficulty = difficulty;
      card.lastReviewed = new Date().toISOString();
      this.persist();
    }
    return card;
  }

  // Quiz Operations
  async getQuizzes(paperId?: string): Promise<Quiz[]> {
    if (firestoreDb) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'quizzes'));
        const allQuizzes = snap.docs.map(doc => doc.data() as Quiz);
        if (paperId) {
          return allQuizzes.filter(q => q.paperId === paperId);
        }
        return allQuizzes;
      } catch (err: any) {
        console.error("Firestore getQuizzes error:", err.message);
      }
    }
    if (paperId) {
      return this.db.quizzes.filter(q => q.paperId === paperId);
    }
    return this.db.quizzes;
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    if (firestoreDb) {
      try {
        const snap = await getDoc(doc(firestoreDb, 'quizzes', id));
        if (snap.exists()) {
          return snap.data() as Quiz;
        }
      } catch (err: any) {
        console.error("Firestore getQuiz error:", err.message);
      }
    }
    return this.db.quizzes.find(q => q.id === id);
  }

  async saveQuiz(quiz: Quiz): Promise<Quiz> {
    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'quizzes', quiz.id), quiz);
        return quiz;
      } catch (err: any) {
        console.error("Firestore saveQuiz error:", err.message);
      }
    }
    const idx = this.db.quizzes.findIndex(q => q.id === quiz.id);
    if (idx > -1) {
      this.db.quizzes[idx] = quiz;
    } else {
      this.db.quizzes.push(quiz);
    }
    this.persist();
    return quiz;
  }

  async submitQuizScore(quizId: string, score: number): Promise<Quiz | undefined> {
    if (firestoreDb) {
      try {
        const snap = await getDoc(doc(firestoreDb, 'quizzes', quizId));
        if (snap.exists()) {
          const quiz = {
            ...snap.data(),
            score,
            takenAt: new Date().toISOString()
          } as Quiz;
          await setDoc(doc(firestoreDb, 'quizzes', quizId), quiz);
          return quiz;
        }
      } catch (err: any) {
        console.error("Firestore submitQuizScore error:", err.message);
      }
    }
    const quiz = this.db.quizzes.find(q => q.id === quizId);
    if (quiz) {
      quiz.score = score;
      quiz.takenAt = new Date().toISOString();
      this.persist();
    }
    return quiz;
  }

  // Chat Sessions
  async getChats(paperId?: string): Promise<ChatSession[]> {
    if (firestoreDb) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'chats'));
        const allChats = snap.docs.map(doc => doc.data() as ChatSession);
        if (paperId) {
          return allChats.filter(c => c.paperId === paperId);
        }
        return allChats;
      } catch (err: any) {
        console.error("Firestore getChats error:", err.message);
      }
    }
    if (paperId) {
      return this.db.chats.filter(c => c.paperId === paperId);
    }
    return this.db.chats;
  }

  async getChat(id: string): Promise<ChatSession | undefined> {
    if (firestoreDb) {
      try {
        const snap = await getDoc(doc(firestoreDb, 'chats', id));
        if (snap.exists()) {
          return snap.data() as ChatSession;
        }
      } catch (err: any) {
        console.error("Firestore getChat error:", err.message);
      }
    }
    return this.db.chats.find(c => c.id === id);
  }

  async createChat(chat: ChatSession): Promise<ChatSession> {
    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'chats', chat.id), chat);
        return chat;
      } catch (err: any) {
        console.error("Firestore createChat error:", err.message);
      }
    }
    this.db.chats.push(chat);
    this.persist();
    return chat;
  }

  async saveChatMessages(chatId: string, messages: any[]): Promise<void> {
    if (firestoreDb) {
      try {
        const snap = await getDoc(doc(firestoreDb, 'chats', chatId));
        if (snap.exists()) {
          const chat = {
            ...snap.data(),
            messages,
            lastMessageAt: new Date().toISOString()
          } as ChatSession;
          await setDoc(doc(firestoreDb, 'chats', chatId), chat);
          return;
        }
      } catch (err: any) {
        console.error("Firestore saveChatMessages error:", err.message);
      }
    }
    const chat = this.db.chats.find(c => c.id === chatId);
    if (chat) {
      chat.messages = messages;
      chat.lastMessageAt = new Date().toISOString();
      this.persist();
    }
  }

  // Literature Review
  async getLiteratureReviews(): Promise<LiteratureReview[]> {
    if (firestoreDb) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'literatureReviews'));
        return snap.docs.map(doc => doc.data() as LiteratureReview);
      } catch (err: any) {
        console.error("Firestore getLiteratureReviews error:", err.message);
      }
    }
    return this.db.literatureReviews;
  }

  async createLiteratureReview(review: LiteratureReview): Promise<LiteratureReview> {
    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'literatureReviews', review.id), review);
        return review;
      } catch (err: any) {
        console.error("Firestore createLiteratureReview error:", err.message);
      }
    }
    this.db.literatureReviews.push(review);
    this.persist();
    return review;
  }

  async deleteLiteratureReview(id: string): Promise<void> {
    if (firestoreDb) {
      try {
        await deleteDoc(doc(firestoreDb, 'literatureReviews', id));
        return;
      } catch (err: any) {
        console.error("Firestore deleteLiteratureReview error:", err.message);
      }
    }
    this.db.literatureReviews = this.db.literatureReviews.filter(lr => lr.id !== id);
    this.persist();
  }

  // Saved Citations
  async getSavedCitations(): Promise<SavedCitation[]> {
    if (firestoreDb) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'savedCitations'));
        return snap.docs.map(doc => doc.data() as SavedCitation);
      } catch (err: any) {
        console.error("Firestore getSavedCitations error:", err.message);
      }
    }
    return this.db.savedCitations;
  }

  async saveCitation(citation: SavedCitation): Promise<SavedCitation> {
    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'savedCitations', citation.id), citation);
        return citation;
      } catch (err: any) {
        console.error("Firestore saveCitation error:", err.message);
      }
    }
    this.db.savedCitations.push(citation);
    this.persist();
    return citation;
  }

  async deleteSavedCitation(id: string): Promise<void> {
    if (firestoreDb) {
      try {
        await deleteDoc(doc(firestoreDb, 'savedCitations', id));
        return;
      } catch (err: any) {
        console.error("Firestore deleteSavedCitation error:", err.message);
      }
    }
    this.db.savedCitations = this.db.savedCitations.filter(c => c.id !== id);
    this.persist();
  }

  // Activity Logs
  async getActivities(): Promise<StudyActivity[]> {
    if (firestoreDb) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'activities'));
        const acts = snap.docs.map(doc => doc.data() as StudyActivity);
        return acts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      } catch (err: any) {
        console.error("Firestore getActivities error:", err.message);
      }
    }
    return this.db.activities;
  }

  async addActivity(activity: Omit<StudyActivity, 'id' | 'timestamp'>): Promise<StudyActivity> {
    const newAct: StudyActivity = {
      id: `sa-${Date.now()}`,
      ...activity,
      timestamp: new Date().toISOString()
    };
    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'activities', newAct.id), newAct);
        return newAct;
      } catch (err: any) {
        console.error("Firestore addActivity error:", err.message);
      }
    }
    this.db.activities.unshift(newAct);
    if (this.db.activities.length > 100) {
      this.db.activities = this.db.activities.slice(0, 100);
    }
    this.persist();
    return newAct;
  }

  // Metrics Calculation
  async getMetrics(): Promise<DashboardMetrics> {
    const activities = await this.getActivities();
    const papers = await this.getPapers();
    const folders = await this.getFolders();
    const quizzes = await this.getQuizzes();

    const readActivitiesCount = activities.filter(a => a.type === 'read').length;
    const readingHours = Math.round((readActivitiesCount * 25 + 15) / 10) / 10 + 4.2;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayIdx = new Date().getDay();
    const dayNamesOrdered = [...days.slice(currentDayIdx), ...days.slice(0, currentDayIdx)];
    
    const weeklyProgress = dayNamesOrdered.map((day, i) => {
      const baseMin = [15, 30, 45, 10, 60, 90, 40][i % 7];
      return {
        day,
        minutes: Math.min(120, baseMin + (activities.length % (i + 1)) * 5)
      };
    });

    return {
      totalPapers: papers.length,
      totalFolders: folders.length,
      quizzesCompleted: quizzes.filter(q => q.score !== undefined).length,
      flashcardsReviewed: activities.filter(a => a.type === 'flashcard').length * 4 + 8,
      readingHours,
      weeklyProgress,
      recentActivity: activities.slice(0, 5)
    };
  }
}

export const db = new ServerDatabase();
