import { connectDB } from './server/config/database';
import { UserModel, IUser } from './server/models/User';
import { PaperModel, IPaper } from './server/models/Paper';
import { FolderModel, IFolder } from './server/models/Folder';
import { ChatSessionModel, IChatSession } from './server/models/ChatSession';
import { NoteModel, INote } from './server/models/Note';
import { FlashcardModel, IFlashcard } from './server/models/Flashcard';
import { QuizModel, IQuiz } from './server/models/Quiz';
import { LiteratureReviewModel, ILiteratureReview } from './server/models/LiteratureReview';
import { SavedCitationModel, ISavedCitation } from './server/models/SavedCitation';
import { StudyActivityModel, IStudyActivity } from './server/models/StudyActivity';

import { 
  User, Paper, Folder, ChatSession, Note, Flashcard, 
  Quiz, LiteratureReview, SavedCitation, StudyActivity, DashboardMetrics 
} from './src/types';

// Note: Automatic database connection trigger removed. The database connection
// is now explicitly initialized and awaited on server startup in server.ts (Task 2).

// Initial Seeding Data Constants
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
    color: '#3B82F6',
    userId: 'u-1',
    createdAt: '2026-07-10T09:15:00Z'
  },
  {
    id: 'f-2',
    name: 'Natural Language Processing',
    description: 'Language modeling, pretraining, and tokenization techniques.',
    color: '#10B981',
    userId: 'u-1',
    createdAt: '2026-07-11T11:45:00Z'
  },
  {
    id: 'f-3',
    name: 'Information Retrieval & RAG',
    description: 'Papers on combining document search with generative models.',
    color: '#F59E0B',
    userId: 'u-1',
    createdAt: '2026-07-12T16:20:00Z'
  }
];

const ATTENTION_TEXT = `
[Page 1: Title & Abstract]
Attention Is All You Need
Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin
Google Brain / Google Research / University of Toronto
Abstract: The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.

[Page 2: Introduction]
1 Introduction
Recurrent neural networks (RNNs) have been firmly established as state-of-the-art approaches in sequence modeling. However, their sequential nature precludes parallelization. In this work, we propose the Transformer.

[Page 3: Model Architecture]
3 Model Architecture
Most competitive neural sequence transduction models have an encoder-decoder structure. The Transformer follows this overall architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder.

[Page 4: Encoder-Decoder Blocks]
3.1 Encoder and Decoder Stacks
Encoder: The encoder is composed of a stack of N = 6 identical layers.
Decoder: The decoder is also composed of a stack of N = 6 identical layers.

[Page 5: Attention Mechanism]
3.2 Attention
An attention function can be described as mapping a query and a set of key-value pairs to an output.
Attention(Q, K, V) = softmax( (Q K^T) / sqrt(d_k) ) V.
`;

const BERT_TEXT = `
[Page 1: Title & Abstract]
BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding
Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova
Abstract: We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers.

[Page 2: Introduction]
1 Introduction
Language model pre-training has been shown to be effective for improving many natural language processing tasks.

[Page 3: Bidirectional Limitation & Proposed Solution]
1.1 Bidirectional Limitations
A major limitation of current pre-trained language models is that standard language models are unidirectional, which is sub-optimal for sentence-level tasks.
`;

const RAG_TEXT = `
[Page 1: Title & Abstract]
Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks
Patrick Lewis, Ethan Perez, Aleksandara Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Wen-tau Yih, Tim Rocktäschel, Sebastian Riedel, Douwe Kiela
Abstract: We introduce retrieval-augmented generation (RAG) models for knowledge-intensive NLP tasks—models which combine pre-trained parametric and non-parametric memory.
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
    summary: 'This review details the trajectory of modern NLP architectures starting from the standard self-attention block (Transformer, 2017), expanding to deep bidirectional language pretraining (BERT, 2018), and eventually merging parametric generation models with non-parametric corpus retrieval indexes (RAG, 2020).',
    gapAnalysis: 'Research gaps exist in real-time continuous document stream integration, low-latency dense vector updating, and handling conflicting sources dynamically inside the generator context.',
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

class ServerDatabase {
  constructor() {
    // Note: Automatic seeding in the constructor has been disabled to prevent
    // queries from running before the MongoDB connection is fully established.
    // Seeding is now explicitly called on server startup after a successful connection (Task 2).
  }

  // Seeding helper for MongoDB
  async seedMongoDBIfNeeded() {
    try {
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        console.log("MongoDB collection 'users' is empty. Performing full seeding...");
        
        for (const u of INITIAL_USERS) {
          // Set password as 'password' which gets hashed automatically via pre-save hook
          await UserModel.create({ _id: u.id, password: 'password', ...u });
        }
        for (const f of INITIAL_FOLDERS) {
          await FolderModel.create({ _id: f.id, ...f });
        }
        for (const p of INITIAL_PAPERS) {
          await PaperModel.create({ _id: p.id, ...p });
        }
        for (const n of INITIAL_NOTES) {
          await NoteModel.create({ _id: n.id, ...n });
        }
        for (const fc of INITIAL_FLASHCARDS) {
          await FlashcardModel.create({ _id: fc.id, ...fc });
        }
        for (const q of INITIAL_QUIZZES) {
          await QuizModel.create({ _id: q.id, ...q });
        }
        for (const lr of INITIAL_LITERATURE_REVIEWS) {
          await LiteratureReviewModel.create({ _id: lr.id, ...lr });
        }
        for (const sc of INITIAL_SAVED_CITATIONS) {
          await SavedCitationModel.create({ _id: sc.id, ...sc });
        }
        for (const sa of INITIAL_STUDY_ACTIVITIES) {
          await StudyActivityModel.create({ _id: sa.id, ...sa });
        }
        
        console.log("MongoDB Atlas database seeded successfully.");
      }
    } catch (err: any) {
      console.error("MongoDB Atlas Seeding failed:", err.message || err);
    }
  }

  // Auth/User Operations
  async getUsers(): Promise<User[]> {
    const docs = await UserModel.find({}).lean();
    return docs.map(d => ({ ...d, id: d._id }) as any);
  }

  async getUser(id: string): Promise<User | undefined> {
    const doc = await UserModel.findById(id).lean();
    if (!doc) return undefined;
    return { ...doc, id: doc._id } as any;
  }

  async createUser(user: User): Promise<User> {
    const doc = await UserModel.create({ _id: user.id, ...user });
    return doc.toJSON() as any;
  }

  // Folder Operations
  async getFolders(): Promise<Folder[]> {
    const docs = await FolderModel.find({}).lean();
    return docs.map(d => ({ ...d, id: d._id }) as any);
  }

  async createFolder(folder: Folder): Promise<Folder> {
    const doc = await FolderModel.create({ _id: folder.id, ...folder });
    return doc.toJSON() as any;
  }

  async deleteFolder(id: string): Promise<void> {
    await FolderModel.deleteOne({ _id: id });
    // Update all papers that were in this folder
    await PaperModel.updateMany({ folderId: id }, { folderId: null });
  }

  // Paper Operations
  async getPapers(): Promise<Paper[]> {
    const docs = await PaperModel.find({}).lean();
    return docs.map(d => ({ ...d, id: d._id }) as any);
  }

  async getPaper(id: string): Promise<Paper | undefined> {
    const doc = await PaperModel.findById(id).lean();
    if (!doc) return undefined;
    return { ...doc, id: doc._id } as any;
  }

  async createPaper(paper: Paper): Promise<Paper> {
    const doc = await PaperModel.create({ _id: paper.id, ...paper });
    return doc.toJSON() as any;
  }

  async updatePaper(id: string, updates: Partial<Paper>): Promise<Paper | undefined> {
    const doc = await PaperModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!doc) return undefined;
    return { ...doc, id: doc._id } as any;
  }

  async deletePaper(id: string): Promise<void> {
    await PaperModel.deleteOne({ _id: id });
    // Delete all dependent sub-resources
    await NoteModel.deleteMany({ paperId: id });
    await FlashcardModel.deleteMany({ paperId: id });
    await QuizModel.deleteMany({ paperId: id });
    await ChatSessionModel.deleteMany({ paperId: id });
    await SavedCitationModel.deleteMany({ paperId: id });
  }

  // Note Operations
  async getNotes(): Promise<Note[]> {
    const docs = await NoteModel.find({}).lean();
    return docs.map(d => ({ ...d, id: d._id }) as any);
  }

  async getNoteForPaper(paperId: string): Promise<Note | undefined> {
    const doc = await NoteModel.findOne({ paperId }).lean();
    if (!doc) return undefined;
    return { ...doc, id: doc._id } as any;
  }

  async createOrUpdateNote(paperId: string, title: string, content: string): Promise<Note> {
    const existing = await NoteModel.findOne({ paperId });
    if (existing) {
      existing.title = title;
      existing.content = content;
      existing.updatedAt = new Date();
      await existing.save();
      return existing.toJSON() as any;
    } else {
      const noteId = `n-${Date.now()}`;
      const doc = await NoteModel.create({
        _id: noteId,
        paperId,
        title,
        content,
        updatedAt: new Date()
      });
      return doc.toJSON() as any;
    }
  }

  // Flashcard Operations
  async getFlashcards(paperId?: string): Promise<Flashcard[]> {
    const query = paperId ? { paperId } : {};
    const docs = await FlashcardModel.find(query).lean();
    return docs.map(d => ({ ...d, id: d._id }) as any);
  }

  async saveFlashcards(cards: Flashcard[]): Promise<void> {
    for (const card of cards) {
      await FlashcardModel.updateOne(
        { _id: card.id },
        { _id: card.id, ...card },
        { upsert: true }
      );
    }
  }

  async updateFlashcardDifficulty(cardId: string, difficulty: 'easy' | 'medium' | 'hard' | null): Promise<Flashcard | undefined> {
    const doc = await FlashcardModel.findByIdAndUpdate(
      cardId,
      { difficulty, lastReviewed: new Date() },
      { new: true }
    ).lean();
    if (!doc) return undefined;
    return { ...doc, id: doc._id } as any;
  }

  // Quiz Operations
  async getQuizzes(paperId?: string): Promise<Quiz[]> {
    const query = paperId ? { paperId } : {};
    const docs = await QuizModel.find(query).lean();
    return docs.map(d => ({ ...d, id: d._id }) as any);
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const doc = await QuizModel.findById(id).lean();
    if (!doc) return undefined;
    return { ...doc, id: doc._id } as any;
  }

  async saveQuiz(quiz: Quiz): Promise<Quiz> {
    await QuizModel.updateOne(
      { _id: quiz.id },
      { _id: quiz.id, ...quiz },
      { upsert: true }
    );
    const doc = await QuizModel.findById(quiz.id).lean();
    return { ...doc, id: doc?._id } as any;
  }

  async submitQuizScore(quizId: string, score: number): Promise<Quiz | undefined> {
    const doc = await QuizModel.findByIdAndUpdate(
      quizId,
      { score, takenAt: new Date() },
      { new: true }
    ).lean();
    if (!doc) return undefined;
    return { ...doc, id: doc._id } as any;
  }

  // Chat Sessions
  async getChats(paperId?: string): Promise<ChatSession[]> {
    const query = paperId ? { paperId } : {};
    const docs = await ChatSessionModel.find(query).lean();
    return docs.map(d => ({ ...d, id: d._id }) as any);
  }

  async getChat(id: string): Promise<ChatSession | undefined> {
    const doc = await ChatSessionModel.findById(id).lean();
    if (!doc) return undefined;
    return { ...doc, id: doc._id } as any;
  }

  async createChat(chat: ChatSession): Promise<ChatSession> {
    const doc = await ChatSessionModel.create({ _id: chat.id, ...chat });
    return doc.toJSON() as any;
  }

  async saveChatMessages(chatId: string, messages: any[]): Promise<void> {
    await ChatSessionModel.findByIdAndUpdate(
      chatId,
      { messages, lastMessageAt: new Date() }
    );
  }

  // Literature Review
  async getLiteratureReviews(): Promise<LiteratureReview[]> {
    const docs = await LiteratureReviewModel.find({}).lean();
    return docs.map(d => ({ ...d, id: d._id }) as any);
  }

  async createLiteratureReview(review: LiteratureReview): Promise<LiteratureReview> {
    const doc = await LiteratureReviewModel.create({ _id: review.id, ...review });
    return doc.toJSON() as any;
  }

  async deleteLiteratureReview(id: string): Promise<void> {
    await LiteratureReviewModel.deleteOne({ _id: id });
  }

  // Saved Citations
  async getSavedCitations(): Promise<SavedCitation[]> {
    const docs = await SavedCitationModel.find({}).lean();
    return docs.map(d => ({ ...d, id: d._id }) as any);
  }

  async saveCitation(citation: SavedCitation): Promise<SavedCitation> {
    const doc = await SavedCitationModel.create({ _id: citation.id, ...citation });
    return doc.toJSON() as any;
  }

  async deleteSavedCitation(id: string): Promise<void> {
    await SavedCitationModel.deleteOne({ _id: id });
  }

  // Activity Logs
  async getActivities(): Promise<StudyActivity[]> {
    const docs = await StudyActivityModel.find({}).sort({ timestamp: -1 }).lean();
    return docs.map(d => ({ ...d, id: d._id }) as any);
  }

  async addActivity(activity: Omit<StudyActivity, 'id' | 'timestamp'>): Promise<StudyActivity> {
    const id = `sa-${Date.now()}`;
    const doc = await StudyActivityModel.create({
      _id: id,
      ...activity,
      timestamp: new Date()
    });
    return doc.toJSON() as any;
  }

  // Dashboard Metrics
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
