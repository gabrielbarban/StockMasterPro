const Auth = require('../models/Auth');
const jwt = require('jsonwebtoken');

const authController = {
    
    async login(req, res) {
        try {
            const { email, password, empresa } = req.body;
            
            if (!email || !password || !empresa) {
                return res.status(400).json({
                    success: false,
                    message: 'Email, senha e empresa são obrigatórios'
                });
            }
            
            const usuario = await Auth.findUsuarioByEmail(email, empresa);
            if (!usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciais inválidas'
                });
            }
            
            const senhaValida = await Auth.verificarPassword(password, usuario.password_hash);
            if (!senhaValida) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciais inválidas'
                });
            }
            
            await Auth.updateUltimoLogin(usuario.id);
            
            const token = jwt.sign(
                { 
                    userId: usuario.id, 
                    empresaId: usuario.empresa_id,
                    tipo: usuario.tipo 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            const { password_hash, ...usuarioSemSenha } = usuario;
            
            res.json({
                success: true,
                token,
                user: usuarioSemSenha,
                empresa: {
                    id: usuario.empresa_id,
                    nome: usuario.empresa_nome,
                    cnpj: usuario.empresa_cnpj
                }
            });
            
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },
    
    async register(req, res) {
        try {
            const { empresa_nome, empresa_cnpj, admin_nome, admin_email, admin_password } = req.body;
            
            if (!empresa_nome || !admin_nome || !admin_email || !admin_password) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos os campos obrigatórios devem ser preenchidos'
                });
            }
            
            if (admin_password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'A senha deve ter pelo menos 6 caracteres'
                });
            }
            
            const { empresa, usuario } = await Auth.registerEmpresaCompleta({
                empresa_nome,
                empresa_cnpj,
                admin_nome,
                admin_email,
                admin_password
            });
            
            const token = jwt.sign(
                { 
                    userId: usuario.id, 
                    empresaId: usuario.empresa_id,
                    tipo: usuario.tipo 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            const { password_hash, ...usuarioSemSenha } = usuario;
            
            res.status(201).json({
                success: true,
                message: 'Empresa criada com sucesso',
                token,
                user: usuarioSemSenha,
                empresa: {
                    id: empresa.id,
                    nome: empresa.nome,
                    cnpj: empresa.cnpj
                }
            });
            
        } catch (error) {
            console.error('Erro no registro:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },
    
    async me(req, res) {
        try {
            const usuario = await Auth.findUsuarioById(req.user.userId);
            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }
            
            const { password_hash, ...usuarioSemSenha } = usuario;
            
            res.json({
                success: true,
                user: usuarioSemSenha,
                empresa: {
                    id: usuario.empresa_id,
                    nome: usuario.empresa_nome,
                    cnpj: usuario.empresa_cnpj
                }
            });
            
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
};

module.exports = authController;