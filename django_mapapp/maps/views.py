from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.contrib.auth import authenticate, login, logout
from .models import ImageModel
from django.contrib.auth.decorators import login_required
from django.views.generic import CreateView
from django.urls import reverse_lazy

def signupfunc(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        try:
            user = User.objects.create_user(username, '', password)
            return render(request, 'signup.html', {'some': 100})
        except IntegrityError:
            return render(request, 'signup.html', {'error': "this username has already exist"})
    return render(request, 'signup.html')


def loginfunc(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('list')
        else:
            return render(request, 'login.html')
    return render(request, 'login.html')


def listfunc(request):
    object_list = ImageModel.objects.all()
    return render(request, 'list.html', {'object_list': object_list})


def logoutfunc(request):
    logout(request)
    return redirect('login')


def detailfunc(request, pk):
    object = get_object_or_404(ImageModel, pk=pk)
    return render(request, 'detail.html', {'object': object})


def goodfunc(request, pk):
    object = ImageModel.objects.get(pk=pk)
    object.good += 1
    object.save()
    return redirect('list')


def readfunc(request, pk):
    object = ImageModel.objects.get(pk=pk)
    username = request.user.get_username()
    if username in object.readtext:
        return redirect('list')
    else:
        object.read += 1
        object.readtext = object.readtext + '' + username
        #同じ苗字なら？pk使う？
        object.save()
        return redirect('list')

class ImageCreate(CreateView):
    template_name = 'create.html'
    model = ImageModel
    fields = ('title','content','author','snsimage')
    success_url = reverse_lazy('list')